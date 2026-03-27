"""
Auth router - unified authentication for all roles.

Endpoints:
  POST /auth              - Hysteria server calls this to validate a client connection
  POST /auth/login        - Login for both admin and user -> access token + refresh cookie
  POST /auth/refresh      - Rotate refresh token -> new access token
  POST /auth/logout       - Revoke refresh token and clear cookie

JWT scheme:
  - Access token  (30 min)  - returned in JSON body, client stores in memory.
                              Does NOT contain role - role is read from DB on each request.
  - Refresh token (30 days) - stored in HttpOnly Secure SameSite=Strict cookie.
  - On access token expiry the client calls POST /auth/refresh (cookie is sent
    automatically), receives a new access token, old refresh token is rotated.
"""

import json
import logging
from datetime import datetime, timezone

from fastapi import (
    APIRouter, 
    Cookie, 
    HTTPException, 
    Request, 
    Response,
)

from config import (
    JWT_REFRESH_TTL_DAYS, 
    COOKIE_SECURE, 
    COOKIE_SAMESITE, 
    RT_REFRESH_REQ, 
    RT_REFRESH_WIN,
)
from database import get_db
from routers.deps import DICT_CURSOR
from rate_limiter import (
    record_failure, 
    record_success, 
    remaining_block_seconds,
    is_blocked, 
    rate_limit,
)
from schemas import (
    LoginRequest, LoginResponse, UserSessionInfo, 
    AccessTokenResponse, HysteriaAuthResponse, StatusResponse,
)
from utils import verify_password
from auth_jwt import (
    create_access_token,
    create_refresh_token,
    revoke_refresh_token,
    validate_refresh_token,
)

router = APIRouter(prefix="/auth")
logger = logging.getLogger(__name__)

# __Host- prefix enforces: HTTPS only, path="/", no Domain attribute.
# In dev (COOKIE_SECURE=false, plain HTTP) browsers ignore the __Host- prefix
# requirement, so the same name works in both modes without any code change.
_REFRESH_COOKIE = "__Host-refresh_token" if COOKIE_SECURE else "refresh_token"
_MAX_BODY_SIZE  = 64 * 1024  # 64 KB


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _set_refresh_cookie(response: Response, token: str) -> None:
    """Set the refresh token as an HttpOnly Secure SameSite cookie."""
    response.set_cookie(
        key      = _REFRESH_COOKIE,
        value    = token,
        max_age  = JWT_REFRESH_TTL_DAYS * 86400,
        httponly = True,                          # not readable by JavaScript
        secure   = COOKIE_SECURE,                 # HTTPS only in production; False for local HTTP dev
        samesite = COOKIE_SAMESITE,
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Remove the refresh token cookie."""
    response.delete_cookie(
        _REFRESH_COOKIE,
        httponly = True,
        secure   = COOKIE_SECURE,
        samesite = COOKIE_SAMESITE,
    )


async def _read_body(request: Request) -> bytes:
    """Read request body with a size cap to prevent OOM from oversized payloads."""
    body = await request.body()
    if len(body) > _MAX_BODY_SIZE:
        raise HTTPException(413, "Request too large")
    return body


# ---------------------------------------------------------------------------
# POST /auth
# Called by the Hysteria server to validate each incoming client connection
# ---------------------------------------------------------------------------

@router.post("", response_model=HysteriaAuthResponse)
async def hysteria_auth(request: Request):
    """
    Validate a Hysteria client connection request.

    Hysteria sends:  {"auth": "username:hyPassword", ...}

    Checks (in order):
      1. IP not blocked by rate limiter
      2. Valid JSON body with "auth" field
      3. User exists in database            — record_failure on miss
      4. User is not banned (allowed flag)  — no record_failure: banned by admin, not brute-force
      5. Subscription is active (active flag) — no record_failure: same reasoning
      6. Subscription has not expired (auto-deactivates if it has) — no record_failure
      7. hyPassword matches                 — record_failure on mismatch

    record_failure is called only for checks where the request looks like a
    brute-force attempt (unknown username, wrong password). Checks 4-6 reject
    known users for account-state reasons, so they do not increment the counter.
    All failures from check 3 onward return a generic "invalid credentials"
    message to avoid leaking whether a username exists or why the request failed.

    Returns {"ok": true, "id": username} on success,
            {"ok": false, "msg": "..."} on any failure.
    """
    client_ip = request.client.host

    if is_blocked(client_ip):
        secs = remaining_block_seconds(client_ip)
        logger.warning("Auth rejected: IP %s is blocked - %ds remaining", client_ip, secs)

        return HysteriaAuthResponse(
            ok  = False, 
            msg = f"Too many failed attempts. Try again in {secs} seconds.",
        )

    logger.debug("Hysteria auth request from IP %s", client_ip)

    # --- Parse request body ---
    try:
        body_bytes = await _read_body(request)
        logger.debug("Request body length: %d bytes", len(body_bytes))

        try:
            body_str = body_bytes.decode("utf-8")
        except UnicodeDecodeError:
            logger.error("Request body is not valid UTF-8")

            return HysteriaAuthResponse(
                ok  = False,
                msg = "Invalid request encoding",
            )

        try:
            body = json.loads(body_str)
        except json.JSONDecodeError as e:
            logger.error("JSON decode error: %s", e)

            return HysteriaAuthResponse(
                ok  = False,
                msg = "Invalid JSON",
            )

    except HTTPException:

        return HysteriaAuthResponse(
            ok  = False, 
            msg = "Request too large", 
        )
    
    except Exception as e:
        logger.exception("Unexpected error reading request body: %s", e)

        return HysteriaAuthResponse(
            ok  = False,
            msg = "Cannot read request body",
        )

    # --- Validate "auth" field ---
    auth = body.get("auth")
    if not auth or not isinstance(auth, str):
        logger.warning("Auth rejected: missing or non-string 'auth' field")

        return HysteriaAuthResponse(
            ok  = False, 
            msg = "Missing or invalid auth field",
        )

    # --- Split "username:hyPassword" ---
    parts = auth.split(":", 1)
    if len(parts) != 2:
        logger.warning("Auth rejected: 'auth' field is not in 'username:password' format")

        return HysteriaAuthResponse(
            ok  = False,
            msg = "Invalid auth format",
        )

    username, hy_password = parts
    logger.debug("Authenticating user: %r", username)

    # --- Database lookup and validation ---
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
                cur.execute(
                    'SELECT "hyPassword", allowed, active, expires_at FROM users WHERE username = %s',
                    (username,),
                )
                row = cur.fetchone()

            if not row:
                # Record failure so that enumerating non-existent usernames is
                # rate-limited the same way as wrong passwords.
                logger.warning("Auth rejected: user %r not found", username)
                record_failure(client_ip)

                return HysteriaAuthResponse(
                    ok  = False,
                    msg = "Invalid credentials",
                )

            # Admin block check — before password so banned accounts cannot be
            # brute-forced. No record_failure: the user is known and blocked by
            # an admin action, not a brute-force attempt.
            if not row["allowed"]:
                logger.warning("Auth rejected: user %r is blocked by admin", username)

                return HysteriaAuthResponse(
                    ok  = False,
                    msg = "Invalid credentials",
                )

            # Profile active check — same reasoning as allowed check above.
            if not row["active"]:
                logger.warning("Auth rejected: user %r profile is inactive", username)

                return HysteriaAuthResponse(
                    ok  = False,
                    msg = "Invalid credentials",
                )

            # Expiration check — must come before the password check so an
            # expired account cannot be brute-forced either.
            expires_dt = row["expires_at"]
            if expires_dt is not None:
                try:
                    if expires_dt.tzinfo is None:
                        # Defensive: should not happen with TIMESTAMPTZ, but guard anyway.
                        expires_dt = expires_dt.replace(tzinfo=timezone.utc)

                    if datetime.now(timezone.utc) > expires_dt:
                        # Subscription expired - auto-deactivate the profile
                        logger.warning(
                            "Auth rejected: subscription expired for user %r - deactivating",
                            username,
                        )
                        with conn.cursor() as upd:
                            upd.execute("UPDATE users SET active = FALSE WHERE username = %s", (username,))

                        return HysteriaAuthResponse(
                            ok  = False,
                            msg = "Invalid credentials",
                        )

                    logger.debug("User %r subscription valid until %s", username, expires_dt)

                except Exception as parse_err:
                    logger.exception("Failed to process expires_at %r for user %r: %s", expires_dt, username, parse_err)

            # Password check — last, so record_failure always fires on a wrong
            # password regardless of which earlier check would have failed.
            if hy_password != row["hyPassword"]:
                logger.warning("Auth rejected: password mismatch for user %r from IP %s", username, client_ip)
                record_failure(client_ip)

                return HysteriaAuthResponse(
                    ok  = False, 
                    msg = "Invalid credentials",
                )

            record_success(client_ip)
            logger.info("Hysteria auth success: user %r from IP %s", username, client_ip)

            return HysteriaAuthResponse(
                ok = True, 
                id = username,
            )

    except Exception as e:
        logger.exception("Database error during hysteria auth: %s", e)

        return HysteriaAuthResponse(
            ok  = False,
            msg = "Internal server error",
        )


# ---------------------------------------------------------------------------
# POST /auth/login  - unified login for admin and user
# ---------------------------------------------------------------------------

@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, request: Request, response: Response):
    """
    Authenticate a user (admin or regular user) and start a session.

    On success returns:
      - access_token  - short-lived JWT, store in JS memory (NOT localStorage)
      - token_type    - "bearer"
      - user          - profile info including role (use to adapt UI only,
                        never trust role from client for authorization decisions)

    Also sets a refresh_token HttpOnly cookie for silent token renewal.
    Rate limited by IP via the in-memory rate limiter.

    Access rules:
      - allowed=False -> 403 banned. User cannot log in at all.
      - active=False  -> login succeeds. User can access their profile but
                         Hysteria will reject VPN connections until the
                         subscription is paid (active=True).
    """
    client_ip = request.client.host

    if is_blocked(client_ip):
        secs = remaining_block_seconds(client_ip)
        raise HTTPException(429, f"Too many failed attempts. Try again in {secs} seconds.")

    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                'SELECT username, password, allowed, active, role, "usedTraffic", expires_at '
                "FROM users WHERE username = %s",
                (body.username,),
            )
            row = cur.fetchone()

        if not row or not verify_password(body.password, row["password"]):
            logger.warning("Failed login attempt for %r from IP %s", body.username, client_ip)
            record_failure(client_ip)
            raise HTTPException(401, "Invalid credentials")

        if not row["allowed"]:
            raise HTTPException(403, "Account is banned")

        record_success(client_ip)

        access_token  = create_access_token(body.username)
        refresh_token = create_refresh_token(body.username, conn)
        conn.commit()

    _set_refresh_cookie(response, refresh_token)
    logger.info("Login success: %r (role=%s) from IP %s", body.username, row["role"], client_ip)

    return LoginResponse(
        access_token = access_token,
        user = UserSessionInfo(
            username    = row["username"],
            role        = row["role"],
            allowed     = bool(row["allowed"]),
            active      = bool(row["active"]),
            usedTraffic = row["usedTraffic"],
            expires_at  = row["expires_at"],
        ),
    )


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------

@router.post(
        "/refresh", 
        response_model=AccessTokenResponse, 
        dependencies=[rate_limit(
            RT_REFRESH_REQ, 
            RT_REFRESH_WIN,
        )]
)
async def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None, alias=_REFRESH_COOKIE),
):
    """
    Exchange a valid refresh token cookie for a new access token.
    The refresh token is rotated on every call (old one deleted, new one issued).
    """
    if not refresh_token:
        raise HTTPException(401, "No refresh token")

    with get_db() as conn:
        username = validate_refresh_token(refresh_token, conn)

        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                "SELECT allowed, active, role FROM users WHERE username = %s", (username,)
            )
            row = cur.fetchone()
        if not row:
            raise HTTPException(401, "User no longer exists")
        if not row["allowed"]:
            raise HTTPException(403, "Account is banned")

        # Rotate: revoke old token, issue new one
        revoke_refresh_token(refresh_token, conn)
        new_refresh = create_refresh_token(username, conn)
        conn.commit()

    access_token = create_access_token(username)
    _set_refresh_cookie(response, new_refresh)

    logger.info("Token refreshed for user %r", username)

    return AccessTokenResponse(
        access_token = access_token,
    )


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------

@router.post("/logout", response_model=StatusResponse)
async def logout(
    response: Response,
    refresh_token: str = Cookie(None, alias=_REFRESH_COOKIE),
):
    """
    Log out by revoking the refresh token and clearing the cookie.
    The access token will naturally expire (max 30 min).
    """
    if refresh_token:
        with get_db() as conn:
            revoke_refresh_token(refresh_token, conn)
            conn.commit()
        logger.info("User logged out - refresh token revoked")

    _clear_refresh_cookie(response)

    return StatusResponse(
        status = "ok",
    )