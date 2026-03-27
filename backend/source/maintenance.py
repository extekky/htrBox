"""
maintenance.py - Background worker: periodic database housekeeping.

Responsibilities (single):
  - Delete traffic_5m rows older than TRAFFIC_RETENTION_DAYS (default 7).
  - Delete expired refresh_tokens rows.

Runs in its own daemon thread on a separate interval from the traffic collector
(default 10 minutes) so housekeeping never delays a traffic poll cycle.
"""

import logging
import threading
import time

from config import MAINTENANCE_INTERVAL, TRAFFIC_RETENTION_DAYS
from database import get_db

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Individual tasks
# ---------------------------------------------------------------------------

def run_traffic_retention(conn) -> None:
    """
    Delete traffic_5m rows older than TRAFFIC_RETENTION_DAYS.
    Expects an open connection; caller is responsible for commit.
    """
    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM traffic_5m WHERE bucket_time < NOW() - (%s * INTERVAL '1 day')",
            (TRAFFIC_RETENTION_DAYS,),
        )
        deleted = cur.rowcount

    if deleted:
        logger.info("Traffic retention: removed %d bucket(s) older than %dd", deleted, TRAFFIC_RETENTION_DAYS)
    else:
        logger.debug("Traffic retention: nothing to remove")


def run_token_cleanup(conn) -> None:
    """
    Delete refresh_tokens rows whose expires_at is in the past.
    Expects an open connection; caller is responsible for commit.
    """
    with conn.cursor() as cur:
        cur.execute("DELETE FROM refresh_tokens WHERE expires_at < NOW()")
        deleted = cur.rowcount

    if deleted:
        logger.info("Token cleanup: removed %d expired refresh token(s)", deleted)
    else:
        logger.debug("Token cleanup: nothing to remove")


# ---------------------------------------------------------------------------
# Combined maintenance run
# ---------------------------------------------------------------------------

def _run_once() -> None:
    """Execute all maintenance tasks in a single transaction."""
    try:
        with get_db() as conn:
            run_traffic_retention(conn)
            run_token_cleanup(conn)
            conn.commit()
    except Exception:
        logger.exception("Maintenance run failed")


# ---------------------------------------------------------------------------
# Background loop
# ---------------------------------------------------------------------------

def _loop(interval: int) -> None:
    logger.info("Maintenance worker started — running every %ds", interval)
    while True:
        time.sleep(interval)   # sleep first: no need to clean up right at startup
        try:
            _run_once()
        except Exception:
            logger.exception("Unexpected error in maintenance worker")


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def start_maintenance_worker(interval: int | None = None) -> threading.Thread:
    """
    Start the maintenance worker in a daemon thread.

    Args:
        interval: Run interval in seconds. Defaults to MAINTENANCE_INTERVAL.
    
    Returns:
        The started Thread object (daemon=True, so it won't block shutdown).
    """
    if interval is None:
        interval = MAINTENANCE_INTERVAL
    thread = threading.Thread(target=_loop, args=(interval,), daemon=True, name="maintenance")
    thread.start()
    return thread