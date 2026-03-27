"""
Servers router - VPN server registry management.

Endpoints:
  GET    /servers             - list servers (public: limited fields; admin: all fields)
  POST   /servers             - register a new server (admin)
  PUT    /servers/{server_id} - update server fields (admin)
  DELETE /servers/{server_id} - remove a server (admin)
"""

import logging
import uuid

from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException,
)

from auth_jwt import optional_user, require_admin
from database import get_db
from routers.deps import DICT_CURSOR
from schemas import (
    CreateServerRequest, DeleteServerResponse, ServerAdminResponse,
    ServerCreateResponse, ServerPublicResponse, UpdateServerRequest,
)

router = APIRouter(prefix="/servers")
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# GET /servers
# ---------------------------------------------------------------------------

@router.get("")
def list_servers(current_user=Depends(optional_user)):
    """
    Return the list of servers.
    - Public (no token): active servers only, no internal hysteria_url
    - Admin: all servers including hysteria_url and inactive ones
    """
    # Resolve role from DB only if a token was provided
    caller_is_admin = False
    if current_user is not None:
        with get_db() as conn:
            with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
                cur.execute("SELECT role FROM users WHERE username = %s", (current_user.username,))
                row = cur.fetchone()
            caller_is_admin = row is not None and row["role"] == "admin"

    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            if caller_is_admin:
                cur.execute(
                    "SELECT id, country, city, ip, domain, port, label, protocol, hysteria_url, active, created_at, updated_at "
                    "FROM servers"
                )
            else:
                cur.execute("SELECT id, country, city, active FROM servers WHERE active = TRUE")
            rows = cur.fetchall()

    result = [_to_admin_response(r) for r in rows] if caller_is_admin else [_to_public_response(r) for r in rows]
    logger.debug("list_servers: %d servers returned (admin=%s)", len(result), caller_is_admin)
    
    return result


# ---------------------------------------------------------------------------
# POST /servers  - register a new server (admin)
# ---------------------------------------------------------------------------

@router.post("", response_model=ServerCreateResponse)
def create_server(
    body: CreateServerRequest,
    _: object = Depends(require_admin),
):
    """Register a new VPN server. Admin only."""
    server_id = str(uuid.uuid4())

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO servers (id, country, city, ip, domain, port, label, protocol, hysteria_url, active) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    server_id,
                    body.country,
                    body.city,
                    body.ip,
                    body.domain,
                    body.port,
                    body.label,
                    body.protocol,
                    body.hysteria_url,
                    bool(body.active),
                ),
            )
        conn.commit()

    logger.info(
        "Server created: id=%s country=%r city=%r ip=%s port=%d",
        server_id, body.country, body.city, body.ip, body.port,
    )

    return ServerCreateResponse(
        id           = server_id,
        country      = body.country,
        city         = body.city,
        ip           = body.ip,
        domain       = body.domain,
        port         = body.port,
        label        = body.label,
        protocol     = body.protocol,
        hysteria_url = body.hysteria_url,
        active       = body.active,
    )


# ---------------------------------------------------------------------------
# PUT /servers/{server_id}  - update server fields (admin)
# ---------------------------------------------------------------------------

@router.put("/{server_id}", response_model=ServerAdminResponse)
def update_server(
    server_id: str,
    body: UpdateServerRequest,
    _: object = Depends(require_admin),
):
    """Update one or more fields on an existing server. Admin only."""
    updates, params = [], []
    if body.country      is not None: updates.append("country = %s");      params.append(body.country)
    if body.city         is not None: updates.append("city = %s");         params.append(body.city)
    if body.ip           is not None: updates.append("ip = %s");           params.append(body.ip)
    if body.domain       is not None: updates.append("domain = %s");       params.append(body.domain)
    if body.port         is not None: updates.append("port = %s");         params.append(body.port)
    if body.label        is not None: updates.append("label = %s");        params.append(body.label)
    if body.protocol     is not None: updates.append("protocol = %s");     params.append(body.protocol)
    if body.hysteria_url is not None: updates.append("hysteria_url = %s"); params.append(body.hysteria_url)
    if body.active       is not None: updates.append("active = %s");       params.append(bool(body.active))

    if not updates:
        raise HTTPException(400, "Nothing to update")

    updates.append("updated_at = NOW()")
    params.append(server_id)

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE servers SET {', '.join(updates)} WHERE id = %s", params)
            if cur.rowcount == 0:
                raise HTTPException(404, "Server not found")

        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                "SELECT id, country, city, ip, domain, port, label, protocol, hysteria_url, active, created_at, updated_at "
                "FROM servers WHERE id = %s",
                (server_id,),
            )
            row = cur.fetchone()

        conn.commit()

    logger.info("Server updated: id=%s", server_id)

    return _to_admin_response(row)


# ---------------------------------------------------------------------------
# DELETE /servers/{server_id}  - remove a server (admin)
# ---------------------------------------------------------------------------

@router.delete("/{server_id}", response_model=DeleteServerResponse)
def delete_server(
    server_id: str,
    _: object = Depends(require_admin),
):
    """Permanently remove a server from the registry. Admin only."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM servers WHERE id = %s", (server_id,))
            if cur.rowcount == 0:
                raise HTTPException(404, "Server not found")
        conn.commit()

    logger.info("Server deleted: id=%s", server_id)

    return DeleteServerResponse(
        status = "deleted",
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _to_admin_response(row) -> ServerAdminResponse:
    """Serialize a DB row to a full admin response model."""
    r = dict(row)

    return ServerAdminResponse(
        id           = r["id"],
        country      = r["country"],
        city         = r["city"],
        ip           = r["ip"],
        domain       = r.get("domain"),
        port         = r.get("port", 443),
        label        = r.get("label", "VPN"),
        protocol     = r["protocol"],
        hysteria_url = r.get("hysteria_url"),
        active       = bool(r["active"]),
        created_at   = r["created_at"],
        updated_at   = r["updated_at"],
    )


def _to_public_response(row) -> ServerPublicResponse:
    """Serialize a DB row to a minimal public response model."""
    r = dict(row)

    return ServerPublicResponse(
        id      = r["id"],
        country = r["country"],
        city    = r["city"],
        active  = bool(r["active"]),
    )