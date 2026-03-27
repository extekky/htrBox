"""
Hysteria router - Hysteria server management and client URL generation.

Endpoints:
  POST /kick                      - disconnect and block users on all servers (admin)
  GET  /online                    - aggregate online users from all servers (admin)
  GET  /generate-url/{username}   - build a hysteria2:// client connection URL (self or admin)
  POST /traffic/reset/{username}  - reset a user's lifetime traffic counter (admin)

HTTP client:
  Uses httpx.AsyncClient for all outbound requests to Hysteria servers.
  This avoids blocking the asyncio event loop (unlike the synchronous
  [requests] library) and keeps FastAPI responsive under concurrent load.
  traffic_collector.py intentionally keeps [requests] because it runs in
  a dedicated daemon thread outside the event loop.
"""

import logging

import httpx
from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    Request,
)
from rate_limiter import rate_limit
from auth_jwt import (
    get_current_user, 
    require_admin, 
    UserTokenData,
)
from config import (
    HYSTERIA_AUTH,
    RT_GENERATE_URL_REQ,
    RT_GENERATE_URL_WIN,
)
from database import get_db
from routers.deps import DICT_CURSOR
from schemas import (
    GenerateUrlResponse, 
    KickUsersRequest, 
    KickUsersResponse, 
    ResetTrafficResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _hysteria_headers() -> dict:
    """Standard headers for all requests to the Hysteria internal API."""
    return {"Authorization": HYSTERIA_AUTH, "Content-Type": "application/json"}


def _get_active_servers(conn) -> list:
    """Return all active servers that have a hysteria_url configured."""
    with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
        cur.execute(
            "SELECT id, ip, hysteria_url FROM servers WHERE active = TRUE AND hysteria_url IS NOT NULL"
        )
        return cur.fetchall()


def _require_servers(servers: list) -> None:
    """
    Raise 503 if no active servers are available.
    Used at the start of every endpoint that must communicate with Hysteria.
    """
    if not servers:
        logger.error("Request rejected: no active servers with hysteria_url in database")
        raise HTTPException(
            503,
            "No active servers configured. Add a server via POST /servers before using this endpoint.",
        )


# ---------------------------------------------------------------------------
# POST /kick  - disconnect and block users (admin)
# ---------------------------------------------------------------------------

@router.post("/kick", response_model=KickUsersResponse)
async def kick_users(
    body: KickUsersRequest,
    _: object = Depends(require_admin),
):
    """Block a list of users in the database and kick their active connections. Admin only."""
    usernames = body.usernames

    with get_db() as conn:
        servers = _get_active_servers(conn)
        _require_servers(servers)

        placeholders = ",".join("%s" for _ in usernames)
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE users SET allowed = FALSE WHERE username IN ({placeholders})",
                usernames,
            )
            updated = cur.rowcount
        conn.commit()

    # Kick active connections on every server
    errors = []
    async with httpx.AsyncClient(timeout=2.0) as client:
        for srv in servers:
            url = srv["hysteria_url"]
            try:
                r = await client.post(
                    f"{url}/kick",
                    headers=_hysteria_headers(),
                    json=usernames,
                )
                r.raise_for_status()
                logger.info("Kicked %d user(s) on server %s", len(usernames), srv["id"])
            except httpx.HTTPError as e:
                logger.error("Kick failed on server %s (%s): %s", srv["id"], url, e)
                errors.append({"server_id": srv["id"], "error": str(e)})

    return KickUsersResponse(
        kicked        = usernames,
        blocked_in_db = updated,
        kick_errors   = errors or None,
    )


# ---------------------------------------------------------------------------
# GET /online  - aggregate online users (admin)
# ---------------------------------------------------------------------------

@router.get("/online")
async def get_online_users(_: object = Depends(require_admin)):
    """Return all currently connected users aggregated across every active server. Admin only."""
    with get_db() as conn:
        servers = _get_active_servers(conn)

    _require_servers(servers)
    merged: dict[str, dict] = {}

    async with httpx.AsyncClient(timeout=2.0) as client:
        for srv in servers:
            url = srv["hysteria_url"]
            try:
                r = await client.get(f"{url}/online", headers=_hysteria_headers())
                r.raise_for_status()
                data = r.json()

                # Hysteria returns {"username": connection_count, ...}
                if isinstance(data, dict):
                    for username, count in data.items():
                        if username not in merged:
                            merged[username] = {"connections": 0, "servers": []}
                        merged[username]["connections"] += int(count or 0)
                        merged[username]["servers"].append(srv["id"])

            except httpx.HTTPError as e:
                logger.error("Online check failed on server %s (%s): %s", srv["id"], url, e)

    return merged


# ---------------------------------------------------------------------------
# GET /generate-url/{username}  - build a client connection URL
# ---------------------------------------------------------------------------

@router.get(
        "/generate-url/{username}", 
        response_model=GenerateUrlResponse,
        dependencies=[rate_limit(
            RT_GENERATE_URL_REQ, 
            RT_GENERATE_URL_WIN,
        )]
)
def generate_connection_url(
    username: str,
    request: Request,
    current_user: UserTokenData = Depends(get_current_user),
):
    """
    Build a hysteria2:// connection URL for the given user.

    Access rules:
      - Admin -> any user
      - Regular user -> only their own URL
    """
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute("SELECT role FROM users WHERE username = %s", (current_user.username,))
            caller_row = cur.fetchone()
        if not caller_row:
            raise HTTPException(401, "User no longer exists")

        caller_is_admin = caller_row["role"] == "admin"

        if not caller_is_admin and current_user.username != username:
            raise HTTPException(403, "Cannot generate URL for another user")

        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute('SELECT "hyPassword" FROM users WHERE username = %s', (username,))
            row = cur.fetchone()
        if not row:
            raise HTTPException(404, "User not found")

        requested_server_id = request.query_params.get("server_id")
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            if requested_server_id:
                cur.execute(
                    "SELECT id, ip, domain, port, label, hysteria_url FROM servers WHERE id = %s AND active = TRUE",
                    (requested_server_id,),
                )
            else:
                cur.execute(
                    "SELECT id, ip, domain, port, label, hysteria_url FROM servers WHERE active = TRUE ORDER BY created_at LIMIT 1"
                )
            srv = cur.fetchone()

        if not srv:
            if requested_server_id:
                raise HTTPException(404, f"Server '{requested_server_id}' not found or inactive")
            raise HTTPException(503, "No active servers configured.")

    srv          = dict(srv)
    host         = srv.get("domain") or srv["ip"]
    hysteria_url = srv.get("hysteria_url") or ""
    insecure     = hysteria_url.startswith("http://")

    url = (
        f"hysteria2://{username}:{row['hyPassword']}"
        f"@{host}:{srv['port']}"
        + ("?insecure=1" if insecure else "")
        + f"#{srv['label'].strip()}"
    )

    return GenerateUrlResponse(
        url         = url,
        server_id   = srv["id"],
        server_host = host,
    )


# ---------------------------------------------------------------------------
# POST /traffic/reset/{username}  - reset usedTraffic (admin)
# ---------------------------------------------------------------------------

@router.post("/traffic/reset/{username}", response_model=ResetTrafficResponse)
def reset_user_traffic(
    username: str,
    _: object = Depends(require_admin),
):
    """Reset the lifetime usedTraffic counter for a user to zero. Admin only."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('UPDATE users SET "usedTraffic" = 0 WHERE username = %s', (username,))
            if cur.rowcount == 0:
                raise HTTPException(404, "User not found")
        conn.commit()

    logger.info("Traffic counter reset for user %r", username)

    return ResetTrafficResponse(
        username    = username,
        usedTraffic = 0,
    )