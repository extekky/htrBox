"""
traffic_collector.py - Background worker: polls Hysteria servers for traffic data.

--------------------------------------------------------------------
 What it does
--------------------------------------------------------------------

Runs as a daemon thread, waking up every TRAFFIC_POLL_INTERVAL seconds
(default 30s). On each tick:

  1. Read the list of active servers from the DB (those with a hysteria_url).
  2. For each server - call GET {hysteria_url}/traffic over HTTP.
     Hysteria returns cumulative byte counters per connected user. The exact
     shape varies across Hysteria versions — two common examples:
       dict format:  {"alice": {"tx": 1200000, "rx": 4800000}, "bob": {"tx": 300000, "rx": 600000}}
       list format:  [{"username": "alice", "tx": 1200000, "rx": 4800000}]
     _normalize_traffic_response() handles all known shapes and always
     returns {username: total_bytes}.
  3. Compare each counter against the last known value stored in traffic_last.
     Compute the delta (bytes used since the previous poll).
  4. Convert the delta to GB and upsert it into traffic_5m at the current
     5-minute bucket boundary (e.g. 14:07:42 -> bucket 14:05:00+00:00).
     Multiple polls that fall in the same bucket are accumulated (summed).
  5. Add the delta to users.usedTraffic - the all-time lifetime counter.
  6. Update traffic_last with the new cumulative value for the next poll.

All HTTP fetches happen BEFORE the DB transaction is opened, so the
connection is never held idle during network I/O.

--------------------------------------------------------------------
 Counter reset handling
--------------------------------------------------------------------

Hysteria resets its in-memory counters to 0 on restart. Without special
handling this would make the delta negative, which would incorrectly
subtract traffic from the user's total.

Detection: if current_total < last_known_total -> counter was reset.
Recovery:  treat current_total as the full delta for this tick
           (we lose traffic that accumulated before the restart but
           avoid corrupting the lifetime counter with a negative value).

First-seen users are stored as baseline only - no delta is emitted because
we don't know how much they used before this backend instance started.

--------------------------------------------------------------------
 Anomaly cap
--------------------------------------------------------------------

Any single-poll delta > _MAX_REASONABLE_DELTA_GB (5 GB) is discarded.
This guards against counter wraparound edge cases that slip past the reset
detection, and against corrupted API responses.

--------------------------------------------------------------------
 DB tables written
--------------------------------------------------------------------

  traffic_last   - last seen cumulative total per (username, server_id).
                   Used only as a scratchpad between polls; not exposed to the API.

  traffic_5m     - time-series of 5-minute deltas per (username, server_id).
                   Queried by the /traffic/* API endpoints and Grafana.

  users          - usedTraffic column updated in the same transaction.

Everything else (retention of old traffic_5m rows, cleanup of expired
refresh tokens) is handled by maintenance.py on its own schedule.
"""

import logging
import threading
import time
from datetime import datetime, timedelta, timezone

import psycopg2.extras
import requests

from config import (
    HYSTERIA_AUTH, 
    TRAFFIC_BUCKET_SECONDS,
    TRAFFIC_POLL_INTERVAL,
)
from database import get_db
from utils import management_url

logger = logging.getLogger(__name__)

_DICT = psycopg2.extras.RealDictCursor

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_GB_BYTES = 1024 ** 3

# Sanity cap: any single delta larger than this is treated as a data anomaly
# (e.g. counter wraparound that wasn't caught) and is discarded silently.
_MAX_REASONABLE_DELTA_GB = 5.0


# ---------------------------------------------------------------------------
# HTTP session - shared across all polls for connection reuse
# ---------------------------------------------------------------------------

_session = requests.Session()
_session.headers.update({"Authorization": HYSTERIA_AUTH, "Content-Type": "application/json"})


# ---------------------------------------------------------------------------
# Time bucketing
# ---------------------------------------------------------------------------

def _get_bucket_time() -> datetime:
    """
    Round the current UTC time down to the nearest bucket boundary.
    Bucket size is controlled by TRAFFIC_BUCKET_SECONDS (default 300 = 5 min).

    Returns a timezone-aware datetime so psycopg2 serialises it with the correct
    UTC offset and PostgreSQL stores it unambiguously as TIMESTAMPTZ.

    Example with 300s buckets:  14:07:42 UTC -> 2026-01-15 14:05:00+00:00
    """
    epoch = datetime(1970, 1, 1, tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    total_secs = int((now - epoch).total_seconds())
    bucket_secs = (total_secs // TRAFFIC_BUCKET_SECONDS) * TRAFFIC_BUCKET_SECONDS
    return epoch + timedelta(seconds=bucket_secs)


# ---------------------------------------------------------------------------
# Hysteria API response parsing
# ---------------------------------------------------------------------------

def _bytes_to_gb(val) -> float:
    """Convert a raw byte value to gigabytes. Returns 0.0 on parse error."""
    try:
        return float(val) / _GB_BYTES
    except Exception:
        return 0.0


def _extract_total_from_entry(entry) -> int:
    """
    Extract a total byte count from a single user's traffic entry.
    Hysteria API response format varies - handles all known variants:
      - int/float  - plain byte total
      - dict       - {uplink, downlink} / {up, down} / {tx, rx} / {sent, recv}
      - dict       - any dict of numeric values (sum them all)
    """
    if isinstance(entry, (int, float)):
        return int(entry)

    if isinstance(entry, dict):
        # Try known uplink/downlink key pairs first
        for up_key, down_key in [("uplink", "downlink"), ("up", "down"), ("tx", "rx"), ("sent", "recv")]:
            if up_key in entry and down_key in entry:
                try:
                    return int(entry.get(up_key, 0) or 0) + int(entry.get(down_key, 0) or 0)
                except Exception:
                    continue

        # Fall back to summing all numeric values in the dict
        total, found = 0, False
        for v in entry.values():
            if isinstance(v, (int, float)):
                total += int(v)
                found = True
        if found:
            return total

    return 0


def _normalize_traffic_response(data) -> dict[str, int]:
    """
    Normalise a raw Hysteria /traffic response into {username: total_bytes}.
    Handles both dict-of-users and list-of-user-objects response shapes.
    """
    out: dict[str, int] = {}

    if isinstance(data, dict):
        # Standard format: {"username": <entry>, ...}
        for username, entry in data.items():
            if isinstance(username, str):
                out[username] = _extract_total_from_entry(entry)
        return out

    if isinstance(data, list):
        for item in data:
            if not isinstance(item, dict):
                continue

            # Look for a username field
            username = None
            for key in ("username", "user", "name"):
                if key in item:
                    username = item.get(key)
                    break

            # Single-key dict: {"someuser": <entry>}
            if username is None and len(item) == 1:
                key = next(iter(item.keys()))
                out[key] = _extract_total_from_entry(item[key])
                continue

            if username:
                out[username] = _extract_total_from_entry(item)

    return out


# ---------------------------------------------------------------------------
# Per-server collection
# ---------------------------------------------------------------------------

def _fetch_traffic(hysteria_url: str) -> dict:
    """
    Fetch raw traffic counters from one Hysteria server.
    Traffic API runs on HYSTERIA_FETCH_PORT (8080), not the VPN port (443).
    Management API always runs over plain HTTP regardless of the server URL scheme.
    Returns an empty dict on any error — the caller skips that server silently.
    """
    url = f"{management_url(hysteria_url)}/traffic"
    logger.debug("Fetching traffic from %s", url)
    try:
        r = _session.get(url, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.error("Failed to fetch traffic from %s: %s", url, e)
        return {}


def _collect_server(server_id: str, totals_gb: dict[str, float], conn) -> None:
    """
    Process pre-fetched traffic totals for one server and write deltas to the DB.

    Accepts an open connection so the caller can batch all servers into a single
    transaction. HTTP fetching happens before the transaction opens so the
    connection is never held during network I/O.

    Delta logic:
      - First seen:      store as baseline, emit no delta.
      - Counter grows:   delta = current − previous.
      - Counter shrinks: Hysteria restarted - treat current value as full delta.
      - Delta > cap:     discard as data anomaly (prevents false spikes).
    """

    bucket_time = _get_bucket_time()

    with conn.cursor(cursor_factory=_DICT) as cur:
        for username, total_gb in totals_gb.items():
            try:
                cur.execute(
                    "SELECT last_total FROM traffic_last WHERE username = %s AND server_id = %s",
                    (username, server_id),
                )
                row = cur.fetchone()

                if row is None:
                    # First time we see this user on this server - store baseline only
                    logger.debug(
                        "New user %r on server %r - storing baseline %.6f GB",
                        username, server_id, total_gb,
                    )
                    cur.execute(
                        """INSERT INTO traffic_last (username, server_id, last_total, last_updated)
                           VALUES (%s, %s, %s, NOW())""",
                        (username, server_id, total_gb),
                    )
                    continue

                last_total_gb = float(row["last_total"] or 0.0)

                if total_gb >= last_total_gb:
                    delta_gb = total_gb - last_total_gb
                else:
                    logger.debug(
                        "Counter reset for user %r on server %r (%.6f -> %.6f GB)",
                        username, server_id, last_total_gb, total_gb,
                    )
                    delta_gb = total_gb

                if delta_gb > _MAX_REASONABLE_DELTA_GB:
                    logger.warning(
                        "Discarding suspicious delta %.4f GB for user %r on server %r "
                        "(cap=%.1f GB) - possible data anomaly",
                        delta_gb, username, server_id, _MAX_REASONABLE_DELTA_GB,
                    )
                    delta_gb = 0.0

                if delta_gb > 0:
                    logger.debug(
                        "User %r server %r: +%.6f GB -> bucket %s",
                        username, server_id, delta_gb, bucket_time,
                    )
                    cur.execute(
                        """INSERT INTO traffic_5m (username, server_id, bucket_time, delta_gb)
                           VALUES (%s, %s, %s, %s)
                           ON CONFLICT (username, server_id, bucket_time)
                           DO UPDATE SET delta_gb = traffic_5m.delta_gb + EXCLUDED.delta_gb""",
                        (username, server_id, bucket_time, delta_gb),
                    )
                    cur.execute(
                        'UPDATE users SET "usedTraffic" = COALESCE("usedTraffic", 0) + %s'
                        ' WHERE username = %s',
                        (delta_gb, username),
                    )

                # Always update last_total - even when delta == 0
                cur.execute(
                    """INSERT INTO traffic_last (username, server_id, last_total, last_updated)
                       VALUES (%s, %s, %s, NOW())
                       ON CONFLICT (username, server_id)
                       DO UPDATE SET last_total   = EXCLUDED.last_total,
                                     last_updated = EXCLUDED.last_updated""",
                    (username, server_id, total_gb),
                )

            except Exception as e:
                logger.error("DB error for user %r on server %r: %s", username, server_id, e)


# ---------------------------------------------------------------------------
# Collection cycle
# ---------------------------------------------------------------------------

def _collect_once() -> None:
    """
    One full poll cycle: fetch counters from every active server, then write
    all deltas in a single transaction.
    """
    with get_db() as conn:
        with conn.cursor(cursor_factory=_DICT) as cur:
            cur.execute(
                "SELECT id, hysteria_url FROM servers"
                " WHERE active = TRUE AND hysteria_url IS NOT NULL"
            )
            servers = cur.fetchall()

    if not servers:
        logger.warning("No active servers with hysteria_url found in DB.")
        return

    # HTTP - outside the transaction
    traffic_data: dict[str, dict[str, int]] = {}
    for srv in servers:
        raw = _fetch_traffic(srv["hysteria_url"])
        traffic_data[srv["id"]] = _normalize_traffic_response(raw)

    # Single write transaction for all servers
    with get_db() as conn:
        for server_id, totals_bytes in traffic_data.items():
            totals_gb = {u: _bytes_to_gb(v) for u, v in totals_bytes.items()}
            if totals_gb:
                _collect_server(server_id, totals_gb, conn)
        conn.commit()


# ---------------------------------------------------------------------------
# Background loop
# ---------------------------------------------------------------------------

def _loop(interval: int) -> None:
    logger.info("Traffic collector started - polling every %ds", interval)
    while True:
        try:
            _collect_once()
        except Exception:
            logger.exception("Unexpected error in traffic collector")
        time.sleep(interval)


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def start_traffic_collector(interval: int | None = None) -> threading.Thread:
    """
    Start the traffic collector in a daemon thread.

    Args:
        interval: Poll interval in seconds. Defaults to TRAFFIC_POLL_INTERVAL.
    """
    if interval is None:
        interval = TRAFFIC_POLL_INTERVAL
    thread = threading.Thread(target=_loop, args=(interval,), daemon=True, name="traffic-collector")
    thread.start()
    return thread