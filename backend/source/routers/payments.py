"""
Payments router - SBP payments through Lava Business.

Endpoints:
  GET  /payments/plans          - list active subscription plans
  GET  /payments/orders/current - return the current pending invoice, if any
  POST /payments/sbp            - create or reuse an SBP invoice through Lava
  POST /payments/lava/webhook   - process Lava status webhooks

Payment flow:
  - User creates an SBP invoice from the profile page.
  - Backend stores a local payment_order before calling Lava, then signs the
    exact outgoing JSON body with HMAC-SHA256 in the Signature header.
  - Lava calls the webhook. Per PAYMENT.md, real webhooks use Authorization,
    signed over canonical JSON (sorted keys, no whitespace), not raw body bytes.
  - Only a valid "success" webhook activates or extends the subscription.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any
from uuid import uuid4
from zoneinfo import ZoneInfo

import httpx
import psycopg2.errors
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from psycopg2.extras import Json

from auth_jwt import require_user
from config import (
    LAVA_ADDITIONAL_KEY,
    LAVA_API_BASE_URL,
    LAVA_EXPIRE_MINUTES,
    LAVA_FAIL_URL,
    LAVA_FUNDS_HOLD_DAYS,
    LAVA_HOOK_URL,
    LAVA_SECRET_KEY,
    LAVA_SHOP_ID,
    LAVA_SUCCESS_URL,
)
from database import get_db
from routers.deps import DICT_CURSOR
from schemas import (
    CreatePaymentRequest,
    LavaWebhookResponse,
    PaymentOrderResponse,
    PlanResponse,
    UserRow,
)

router = APIRouter(prefix="/payments")
logger = logging.getLogger(__name__)

_PROVIDER = "lava.ru"
_LAVA_DT_TZ = ZoneInfo("Europe/Moscow")
_STATUS_MAP = {
    "created": "pending",
    "success": "paid",
    "fail": "failed",
    "expired": "expired",
    "refund": "refunded",
}


# ---------------------------------------------------------------------------
# Lava signing / parsing helpers
# ---------------------------------------------------------------------------

def _require_lava_config() -> None:
    """Fail lazily if SBP payments are used without required Lava settings."""
    missing = [
        name
        for name, value in (
            ("LAVA_SHOP_ID", LAVA_SHOP_ID),
            ("LAVA_SECRET_KEY", LAVA_SECRET_KEY),
            ("LAVA_HOOK_URL", LAVA_HOOK_URL),
        )
        if not value
    ]
    if missing:
        raise HTTPException(503, f"Payment provider is not configured: {', '.join(missing)}")


def _minor_to_rubles(amount_minor: int) -> float:
    """Convert kopecks to a ruble amount accepted by Lava invoice/create."""
    return float((Decimal(amount_minor) / Decimal(100)).quantize(Decimal("0.01")))


def _decimal_to_minor(value: Any) -> int:
    """Parse Lava string amounts like '1.00' as Decimal, never float."""
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise HTTPException(400, "Invalid Lava amount")
    return int((amount * Decimal(100)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _parse_lava_datetime(value: str | None) -> datetime:
    """Parse Lava's naive Moscow-time 'YYYY-MM-DD HH:MI:SS' timestamps as UTC."""
    if not value:
        return datetime.now(timezone.utc) + timedelta(minutes=LAVA_EXPIRE_MINUTES)
    try:
        dt = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return datetime.now(timezone.utc) + timedelta(minutes=LAVA_EXPIRE_MINUTES)
    return dt.replace(tzinfo=_LAVA_DT_TZ).astimezone(timezone.utc)


def _canonical_webhook_body(raw_body: bytes) -> tuple[dict[str, Any], bytes]:
    """Return parsed webhook JSON and the canonical body Lava signs."""
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid JSON")
    if not isinstance(payload, dict):
        raise HTTPException(400, "Invalid webhook payload")

    canonical = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return payload, canonical


def _is_valid_webhook_signature(raw_body: bytes, auth_header: str | None) -> tuple[dict[str, Any], bool]:
    """Validate Lava webhook Authorization using the additional key."""
    payload, canonical = _canonical_webhook_body(raw_body)
    if not LAVA_ADDITIONAL_KEY or not auth_header:
        return payload, False

    expected = hmac.new(
        LAVA_ADDITIONAL_KEY.encode("utf-8"),
        canonical,
        hashlib.sha256,
    ).hexdigest()
    return payload, hmac.compare_digest(expected, auth_header.strip())


def _signed_lava_body(payload: dict[str, Any]) -> tuple[str, str]:
    """Serialise and sign the exact outgoing Lava request body."""
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    signature = hmac.new(
        LAVA_SECRET_KEY.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return body, signature


# ---------------------------------------------------------------------------
# Response builders
# ---------------------------------------------------------------------------

def _row_to_plan(row: dict[str, Any]) -> PlanResponse:
    """Convert a joined DB row into the public plan response."""
    return PlanResponse(
        id=row["plan_id"],
        code=row["plan_code"],
        name=row["plan_name"],
        amount_minor=row["amount_minor"],
        currency=row["currency"],
        period_days=row["period_days"],
        renewal_window_days=row["renewal_window_days"],
    )


def _row_to_order(row: dict[str, Any]) -> PaymentOrderResponse:
    """Convert a joined DB row into the public payment order response."""
    return PaymentOrderResponse(
        id=row["id"],
        order_number=row["order_number"],
        status=row["status"],
        amount_minor=row["amount_minor"],
        currency=row["currency"],
        payment_page_url=row["payment_page_url"],
        provider_payment_id=row["provider_payment_id"],
        expires_at=row["expires_at"],
        plan=_row_to_plan(row),
    )


def _fetch_order_response(conn, order_id: int) -> PaymentOrderResponse:
    """Fetch a payment order with its plan after DB mutation."""
    with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
        cur.execute(
            """
            SELECT
                po.id, po.order_number, po.status, po.amount_minor, po.currency,
                po.payment_page_url, po.provider_payment_id, po.expires_at,
                p.id AS plan_id, p.code AS plan_code, p.name AS plan_name,
                p.period_days, p.renewal_window_days
            FROM payment_orders po
            JOIN plans p ON p.id = po.plan_id
            WHERE po.id = %s
            """,
            (order_id,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Payment order not found")
    return _row_to_order(row)


# ---------------------------------------------------------------------------
# GET /payments/plans
# ---------------------------------------------------------------------------

@router.get("/plans", response_model=list[PlanResponse])
def list_plans(_: UserRow = Depends(require_user)):
    """Return active subscription plans available to the current user."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT
                    id AS plan_id, code AS plan_code, name AS plan_name,
                    amount_minor, currency, period_days, renewal_window_days
                FROM plans
                WHERE is_active = TRUE
                ORDER BY amount_minor ASC, id ASC
                """
            )
            rows = cur.fetchall()
    return [_row_to_plan(row) for row in rows]


# ---------------------------------------------------------------------------
# GET /payments/orders/current
# ---------------------------------------------------------------------------

@router.get("/orders/current", response_model=PaymentOrderResponse | None)
def get_current_order(user: UserRow = Depends(require_user)):
    """Return the user's latest live pending invoice, if it still can be paid."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT
                    po.id, po.order_number, po.status, po.amount_minor, po.currency,
                    po.payment_page_url, po.provider_payment_id, po.expires_at,
                    p.id AS plan_id, p.code AS plan_code, p.name AS plan_name,
                    p.period_days, p.renewal_window_days
                FROM payment_orders po
                JOIN plans p ON p.id = po.plan_id
                WHERE po.username = %s AND po.status = 'pending' AND po.expires_at > NOW()
                ORDER BY po.created_at DESC
                LIMIT 1
                """,
                (user["username"],),
            )
            row = cur.fetchone()
    return _row_to_order(row) if row else None


# ---------------------------------------------------------------------------
# POST /payments/sbp
# ---------------------------------------------------------------------------

@router.post("/sbp", response_model=PaymentOrderResponse)
async def create_sbp_payment(
    body: CreatePaymentRequest,
    user: UserRow = Depends(require_user),
):
    """
    Create a Lava invoice limited to SBP, or reuse an existing live invoice.

    Renewal is allowed only inside the plan's renewal window. The local order is
    created before the provider call so every external attempt has an audit row.
    """
    _require_lava_config()

    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT id, code, name, amount_minor, currency, period_days, renewal_window_days
                FROM plans
                WHERE code = %s AND is_active = TRUE
                """,
                (body.plan_code,),
            )
            plan = cur.fetchone()
            if not plan:
                raise HTTPException(404, "Plan not found")

            cur.execute(
                "SELECT active, expires_at, role FROM users WHERE username = %s FOR UPDATE",
                (user["username"],),
            )
            user_row = cur.fetchone()
            if not user_row:
                raise HTTPException(401, "User no longer exists")
            if user_row["role"] == "admin":
                raise HTTPException(403, "Admin accounts do not need subscription payments")

            expires_at = user_row["expires_at"]
            if expires_at is not None:
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                renew_after = expires_at - timedelta(days=plan["renewal_window_days"])
                if user_row["active"] and datetime.now(timezone.utc) < renew_after:
                    raise HTTPException(400, "Renewal is not available yet")

            cur.execute(
                """
                SELECT
                    po.id, po.order_number, po.status, po.amount_minor, po.currency,
                    po.payment_page_url, po.provider_payment_id, po.expires_at,
                    p.id AS plan_id, p.code AS plan_code, p.name AS plan_name,
                    p.period_days, p.renewal_window_days
                FROM payment_orders po
                JOIN plans p ON p.id = po.plan_id
                WHERE po.username = %s
                  AND po.status = 'pending'
                  AND po.expires_at > NOW()
                  AND po.payment_page_url IS NOT NULL
                ORDER BY po.created_at DESC
                LIMIT 1
                """,
                (user["username"],),
            )
            existing = cur.fetchone()
            if existing:
                return _row_to_order(existing)

            order_number = f"htrbox_{datetime.now(timezone.utc):%Y%m%d%H%M%S}_{uuid4().hex[:12]}"
            custom_fields = {
                "username": user["username"],
                "plan_id": plan["id"],
                "plan_code": plan["code"],
                "order_number": order_number,
            }
            local_expires_at = datetime.now(timezone.utc) + timedelta(minutes=LAVA_EXPIRE_MINUTES)

            cur.execute(
                """
                INSERT INTO payment_orders (
                    username, plan_id, amount_minor, currency, status,
                    provider_status_raw, idempotency_key, order_number,
                    provider, custom_fields, expires_at
                )
                VALUES (%s, %s, %s, %s, 'pending', 'created_local', %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    user["username"],
                    plan["id"],
                    plan["amount_minor"],
                    plan["currency"],
                    uuid4().hex,
                    order_number,
                    _PROVIDER,
                    Json(custom_fields),
                    local_expires_at,
                ),
            )
            inserted_order = cur.fetchone()
            if not inserted_order:
                raise HTTPException(500, "Payment order was not created")
            order_id = inserted_order["id"]
        conn.commit()

    lava_payload: dict[str, Any] = {
        "shopId": LAVA_SHOP_ID,
        "sum": _minor_to_rubles(plan["amount_minor"]),
        "orderId": order_number,
        "hookUrl": LAVA_HOOK_URL,
        "expire": LAVA_EXPIRE_MINUTES,
        "includeService": ["sbp"],
        "customFields": json.dumps(custom_fields, ensure_ascii=False, separators=(",", ":")),
        "comment": plan["name"],
    }
    if LAVA_SUCCESS_URL:
        lava_payload["successUrl"] = LAVA_SUCCESS_URL
    if LAVA_FAIL_URL:
        lava_payload["failUrl"] = LAVA_FAIL_URL

    request_body, signature = _signed_lava_body(lava_payload)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{LAVA_API_BASE_URL}/invoice/create",
                content=request_body,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Signature": signature,
                },
            )
            response.raise_for_status()
            lava_response = response.json()
    except (httpx.HTTPError, ValueError) as e:
        logger.exception("Lava invoice creation failed for order %s: %s", order_number, e)
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE payment_orders
                    SET status = 'failed',
                        provider_status_raw = 'create_error',
                        failed_at = NOW(),
                        updated_at = NOW()
                    WHERE id = %s
                    """,
                    (order_id,),
                )
            conn.commit()
        raise HTTPException(502, "Payment provider request failed")

    if not lava_response.get("status_check"):
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE payment_orders
                    SET status = 'failed',
                        provider_status_raw = 'create_error',
                        failed_at = NOW(),
                        updated_at = NOW()
                    WHERE id = %s
                    """,
                    (order_id,),
                )
            conn.commit()
        raise HTTPException(502, str(lava_response.get("error") or "Payment provider rejected invoice"))

    data = lava_response.get("data") or {}
    provider_payment_id = data.get("id") or data.get("invoice_id") or data.get("invoiceId")
    payment_page_url = data.get("url") or data.get("payment_url") or data.get("paymentUrl")
    provider_status = data.get("status") or "created"
    provider_expires_at = _parse_lava_datetime(data.get("expired"))

    if not provider_payment_id or not payment_page_url:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE payment_orders
                    SET status = 'failed',
                        provider_status_raw = 'create_incomplete_response',
                        failed_at = NOW(),
                        updated_at = NOW()
                    WHERE id = %s
                    """,
                    (order_id,),
                )
            conn.commit()
        raise HTTPException(502, "Payment provider returned incomplete invoice data")

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE payment_orders
                SET provider_status_raw = %s,
                    provider_payment_id = %s,
                    payment_page_url = %s,
                    expires_at = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (provider_status, provider_payment_id, payment_page_url, provider_expires_at, order_id),
            )
            cur.execute(
                """
                INSERT INTO payment_events (
                    payment_order_id, provider, provider_invoice_id, event_type,
                    status_from, status_to, raw_payload, auth_token_valid, processed_at
                )
                VALUES (%s, %s, %s, 'invoice_created', NULL, 'pending', %s, TRUE, NOW())
                ON CONFLICT DO NOTHING
                """,
                (order_id, _PROVIDER, provider_payment_id, Json(lava_response)),
            )
        conn.commit()
        return _fetch_order_response(conn, order_id)


# ---------------------------------------------------------------------------
# POST /payments/lava/webhook
# ---------------------------------------------------------------------------

@router.post("/lava/webhook", response_model=LavaWebhookResponse)
async def lava_webhook(
    request: Request,
    authorization: str | None = Header(default=None),
):
    """
    Process a Lava webhook and update the local order idempotently.

    Duplicate delivery is detected by payment_events unique index on
    (provider, invoice_id, status). Invalid signatures are stored in the event
    log but are not allowed to mutate orders or subscriptions.
    """
    raw_body = await request.body()
    payload, signature_valid = _is_valid_webhook_signature(raw_body, authorization)

    invoice_id = str(payload.get("invoice_id") or "")
    order_number = str(payload.get("order_id") or "")
    lava_status = str(payload.get("status") or "")
    status_to = _STATUS_MAP.get(lava_status)

    if not invoice_id or not order_number or not status_to:
        raise HTTPException(400, "Unsupported Lava webhook payload")

    with get_db() as conn:
        try:
            with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
                cur.execute(
                    """
                    SELECT po.*, p.period_days, u.expires_at AS user_expires_at
                    FROM payment_orders po
                    JOIN plans p ON p.id = po.plan_id
                    LEFT JOIN users u ON u.username = po.username
                    WHERE po.order_number = %s OR po.provider_payment_id = %s
                    FOR UPDATE OF po
                    """,
                    (order_number, invoice_id),
                )
                order = cur.fetchone()
                if not order:
                    raise HTTPException(404, "Payment order not found")

                status_from = order["status"]
                cur.execute(
                    """
                    INSERT INTO payment_events (
                        payment_order_id, provider, provider_invoice_id, event_type,
                        status_from, status_to, raw_payload, auth_token_valid, processed_at
                    )
                    VALUES (%s, %s, %s, 'webhook_received', %s, %s, %s, %s, NOW())
                    ON CONFLICT DO NOTHING
                    RETURNING id
                    """,
                    (
                        order["id"],
                        _PROVIDER,
                        invoice_id,
                        status_from,
                        status_to,
                        Json(payload),
                        signature_valid,
                    ),
                )
                event_inserted = cur.fetchone() is not None

                if not signature_valid:
                    conn.commit()
                    raise HTTPException(401, "Invalid webhook signature")

                if not event_inserted:
                    conn.commit()
                    return LavaWebhookResponse(status="duplicate")

                update_fields = [
                    "status = %s",
                    "provider_status_raw = %s",
                    "provider_payment_id = COALESCE(provider_payment_id, %s)",
                    "updated_at = NOW()",
                ]
                params: list[Any] = [status_to, lava_status, invoice_id]

                if status_to == "paid":
                    amount_minor = _decimal_to_minor(payload.get("amount"))
                    if amount_minor != order["amount_minor"]:
                        raise HTTPException(400, "Webhook amount does not match payment order")

                    credited_raw = payload.get("credited")
                    net_amount_minor = (
                        _decimal_to_minor(credited_raw)
                        if credited_raw is not None
                        else None
                    )
                    fee_minor = (
                        amount_minor - net_amount_minor
                        if net_amount_minor is not None
                        else None
                    )
                    fee_rate = (
                        Decimal(fee_minor) / Decimal(amount_minor)
                        if fee_minor is not None and amount_minor > 0
                        else None
                    )
                    paid_at = _parse_lava_datetime(payload.get("pay_time"))
                    funds_available_at = paid_at + timedelta(days=LAVA_FUNDS_HOLD_DAYS)

                    update_fields.extend(
                        [
                            "paid_at = %s",
                            "net_amount_minor = %s",
                            "provider_fee_minor = %s",
                            "provider_fee_rate = %s",
                            "funds_hold_days = %s",
                            "funds_available_at = %s",
                        ]
                    )
                    params.extend(
                        [
                            paid_at,
                            net_amount_minor,
                            fee_minor,
                            fee_rate,
                            LAVA_FUNDS_HOLD_DAYS,
                            funds_available_at,
                        ]
                    )

                    subscription_base = order["user_expires_at"]
                    if subscription_base is None or subscription_base < paid_at:
                        subscription_base = paid_at
                    new_expires_at = subscription_base + timedelta(days=order["period_days"])

                    cur.execute(
                        """
                        UPDATE users
                        SET active = TRUE,
                            allowed = TRUE,
                            expires_at = %s
                        WHERE username = %s
                        """,
                        (new_expires_at, order["username"]),
                    )

                elif status_to == "failed":
                    update_fields.append("failed_at = COALESCE(failed_at, NOW())")
                elif status_to == "expired":
                    update_fields.append("failed_at = COALESCE(failed_at, NOW())")
                elif status_to == "refunded":
                    update_fields.append("refunded_at = COALESCE(refunded_at, NOW())")

                params.append(order["id"])
                cur.execute(
                    f"UPDATE payment_orders SET {', '.join(update_fields)} WHERE id = %s",
                    params,
                )

                if str(payload.get("pay_service") or "") == "sbp":
                    cur.execute(
                        """
                        INSERT INTO sbp_payments (payment_order_id, payer_details)
                        VALUES (%s, %s)
                        ON CONFLICT (payment_order_id)
                        DO UPDATE SET payer_details = EXCLUDED.payer_details, updated_at = NOW()
                        """,
                        (order["id"], Json(payload.get("payer_details"))),
                    )

            conn.commit()
        except HTTPException:
            conn.rollback()
            raise
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            return LavaWebhookResponse(status="duplicate")

    return LavaWebhookResponse(status="processed")
