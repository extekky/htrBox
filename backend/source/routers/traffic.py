"""
Traffic router - used by admin UI and user UI (+ Grafana in future).

Endpoints:
  GET /traffic/me                  - own traffic buckets (any authenticated user)
  GET /traffic/user/{username}     - per-user buckets                (admin only)
  GET /traffic/server/{server_id}  - per-server buckets              (admin only)
  GET /traffic/summary             - all buckets aggregated          (admin only)
  GET /traffic/users/totals        - total GB per user over a period (admin only)
"""

import logging

from fastapi import (
    APIRouter, 
    Depends,
    HTTPException, 
    Query,
)

from database import get_db
from routers.deps import DICT_CURSOR
from schemas import (
    TrafficBucketResponse, 
    TrafficServerBucketResponse, 
    TrafficUserTotalResponse,
)
from auth_jwt import require_admin, require_user
from rate_limiter import rate_limit
from config import (
    RT_TRAFFIC_REQ, 
    RT_TRAFFIC_WIN,
)

router = APIRouter(prefix="/traffic")
logger = logging.getLogger(__name__)

_MAX_ROWS = 10_000


# ---------------------------------------------------------------------------
# GET /traffic/me  - own traffic (any authenticated user)
# ---------------------------------------------------------------------------

@router.get(
        "/me", 
        response_model=list[TrafficBucketResponse], 
        dependencies=[rate_limit(
            RT_TRAFFIC_REQ, 
            RT_TRAFFIC_WIN,
        )]
)
def my_traffic(
    days: int = Query(default=3, ge=1, le=7),
    user_row=Depends(require_user),
):
    """5-minute traffic buckets for the currently authenticated user."""
    if not user_row["active"]:
        raise HTTPException(status_code=403, detail="Inactive account")
    
    username = user_row["username"]
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT bucket_time AS time, SUM(delta_gb) AS delta_gb, 'all' AS server_id
                FROM traffic_5m
                WHERE username = %s
                  AND bucket_time >= NOW() - (%s * INTERVAL '1 day')
                GROUP BY bucket_time
                ORDER BY bucket_time
                LIMIT %s
                """,
                (username, days, _MAX_ROWS),
            )
            rows = cur.fetchall()

    return [
        TrafficBucketResponse(
            time      = r["time"],
            delta_gb  = r["delta_gb"],
            server_id = r["server_id"],
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /traffic/user/{username}
# ---------------------------------------------------------------------------

@router.get("/user/{username}", response_model=list[TrafficBucketResponse])
def user_traffic(
    username: str,
    days: int = Query(default=3, ge=1, le=7),
    server_id: str = Query(default=None),
    _: object = Depends(require_admin),
):
    """5-minute traffic buckets for a specific user. Admin only."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            if server_id:
                cur.execute(
                    """
                    SELECT bucket_time AS time, delta_gb, server_id
                    FROM traffic_5m
                    WHERE username = %s
                      AND server_id = %s
                      AND bucket_time >= NOW() - (%s * INTERVAL '1 day')
                    ORDER BY bucket_time
                    LIMIT %s
                    """,
                    (username, server_id, days, _MAX_ROWS),
                )
            else:
                cur.execute(
                    """
                    SELECT bucket_time AS time, SUM(delta_gb) AS delta_gb, 'all' AS server_id
                    FROM traffic_5m
                    WHERE username = %s
                      AND bucket_time >= NOW() - (%s * INTERVAL '1 day')
                    GROUP BY bucket_time
                    ORDER BY bucket_time
                    LIMIT %s
                    """,
                    (username, days, _MAX_ROWS),
                )
            rows = cur.fetchall()

    return [
        TrafficBucketResponse(
            time      = r["time"],
            delta_gb  = r["delta_gb"],
            server_id = r["server_id"],
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /traffic/server/{server_id}
# ---------------------------------------------------------------------------

@router.get("/server/{server_id}", response_model=list[TrafficServerBucketResponse])
def server_traffic(
    server_id: str,
    days: int = Query(default=3, ge=1, le=7),
    _: object = Depends(require_admin),
):
    """5-minute traffic buckets for a specific server. Admin only."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT bucket_time AS time, SUM(delta_gb) AS delta_gb
                FROM traffic_5m
                WHERE server_id = %s
                  AND bucket_time >= NOW() - (%s * INTERVAL '1 day')
                GROUP BY bucket_time
                ORDER BY bucket_time
                LIMIT %s
                """,
                (server_id, days, _MAX_ROWS),
            )
            rows = cur.fetchall()

    return [
        TrafficServerBucketResponse(
            time     = r["time"],
            delta_gb = r["delta_gb"],
        ) 
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /traffic/summary
# ---------------------------------------------------------------------------

@router.get(
        "/summary", 
        response_model=list[TrafficServerBucketResponse], 
        dependencies=[rate_limit(
            RT_TRAFFIC_REQ, 
            RT_TRAFFIC_WIN,
        )]
)
def traffic_summary(
    days: int = Query(default=3, ge=1, le=7),
    _: object = Depends(require_admin),
):
    """Total traffic across all users and servers. Admin only."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT bucket_time AS time, SUM(delta_gb) AS delta_gb
                FROM traffic_5m
                WHERE bucket_time >= NOW() - (%s * INTERVAL '1 day')
                GROUP BY bucket_time
                ORDER BY bucket_time
                LIMIT %s
                """,
                (days, _MAX_ROWS),
            )
            rows = cur.fetchall()

    return [
        TrafficServerBucketResponse(
            time     = r["time"],
            delta_gb = r["delta_gb"],
        ) 
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /traffic/users/totals
# ---------------------------------------------------------------------------

@router.get(
        "/users/totals", 
        response_model=list[TrafficUserTotalResponse], 
        dependencies=[rate_limit(
            RT_TRAFFIC_REQ, 
            RT_TRAFFIC_WIN,
        )]
)
def users_totals(
    days: int = Query(default=3, ge=1, le=7),
    _: object = Depends(require_admin),
):
    """Total GB consumed per user over the last N days. Admin only."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                """
                SELECT username, SUM(delta_gb) AS total_gb
                FROM traffic_5m
                WHERE bucket_time >= NOW() - (%s * INTERVAL '1 day')
                GROUP BY username
                ORDER BY total_gb DESC
                """,
                (days,),
            )
            rows = cur.fetchall()

    return [
        TrafficUserTotalResponse(
            username = r["username"], 
            total_gb = round(r["total_gb"], 6),
        )
        for r in rows
    ]