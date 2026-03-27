"""
rate_limiter.py - In-memory brute-force protection for auth endpoints.

Two independent rate-limit mechanisms are provided:

  Auth failure tracker (brute-force protection):
    - Tracks failed authentication attempts per key (IP address or username).
    - After RT_MAX_FAILURES consecutive failures, the key is blocked
      for RT_BLOCK_DURATION seconds.
    - The entry is removed automatically when the block expires or when
      the key successfully authenticates, giving it a clean slate.
    - Use IP-based keys for endpoints where requests come directly from
      clients (e.g. /auth/login).
    - Use username-based keys for endpoints where requests come from a
      trusted server on behalf of a user (e.g. /auth - Hysteria server auth),
      since all such requests share the same IP and blocking by IP would
      affect all users at once.

  Sliding-window request limiter (volume cap):
    - Counts all requests from an IP within a rolling time window.
    - Used for public endpoints like /users/register where request
      volume itself is the risk, regardless of success or failure.
    - Configurable per call-site: limit and window_seconds are passed
      as arguments to check_rate_limit().

Cleanup:
  - A background daemon thread runs every _CLEANUP_INTERVAL seconds and
    removes stale entries from both stores.
  - Auth store: removes keys whose block has expired and that haven't been
    seen for longer than _STALE_ENTRY_TTL seconds.
  - Sliding window store: evicts timestamps older than 1 hour from active
    entries, then removes entries not seen for _STALE_ENTRY_TTL seconds.
  - This prevents unbounded memory growth when the service runs for a long
    time and sees many unique keys.

Both auth-failure thresholds are configurable via environment variables
(see config.py: RT_MAX_FAILURES, RT_BLOCK_DURATION).

Rate limiting is intentionally NOT applied to admin endpoints.
Admins are authenticated via require_admin() and are considered trusted
actors — adding rate limits there would only risk locking out legitimate
administrators.

--------------------------------------------------------------------
 Known limitations (intentional trade-offs)
--------------------------------------------------------------------

  1. State resets on restart.
     All counters and blocks are lost when the process restarts.
     This is intentional — the rate limiter is designed to slow down
     active attacks, not to persist a history of past offenders.

  2. Not shared across multiple instances / replicas.
     Each process maintains its own in-memory store. If you run more than
     one backend instance behind a load balancer, an attacker can bypass
     the limiter by distributing requests across instances.

  3. IP spoofing / proxies.
     Rate limiting by client IP is ineffective if the attacker rotates IPs
     or operates behind a residential proxy network. This is a fundamental
     limitation of IP-based rate limiting, not specific to this implementation.
     For Hysteria auth, username-based keys are used instead to avoid this
     problem entirely.
"""

import logging
import threading
import time
from typing import TypedDict

from fastapi import Depends, HTTPException, Request
from config import RT_MAX_FAILURES, RT_BLOCK_DURATION

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tuning constants
# ---------------------------------------------------------------------------

# How often (seconds) the cleanup thread wakes up to sweep stale entries.
# No need to run this very often - once every few minutes is enough.
_CLEANUP_INTERVAL = 300  # 5 minutes

# An unblocked entry is considered stale and removed if the key hasn't been
# seen (no failures, no successes) for this many seconds.
# Should be comfortably longer than RT_BLOCK_DURATION so that
# a blocked key still has its entry around when it tries again after the block.
_STALE_ENTRY_TTL = max(RT_BLOCK_DURATION * 3, 900)  # at least 15 min


# ---------------------------------------------------------------------------
# Internal state
# ---------------------------------------------------------------------------

class _RateLimitEntry(TypedDict):
    failures:      int
    blocked_until: float | None
    last_seen:     float


_store: dict[str, _RateLimitEntry] = {}
_lock = threading.Lock()


def _now() -> float:
    """Monotonic timestamp - not affected by system clock changes."""
    return time.monotonic()


# ---------------------------------------------------------------------------
# Background cleanup
# ---------------------------------------------------------------------------

def _cleanup_stale_entries() -> None:
    """
    Remove entries that are no longer useful from both rate-limit stores.

    Auth failure store (_store):
      - Removes entries where the block has expired (or was never set)
        AND the key hasn't been seen for _STALE_ENTRY_TTL seconds.
      - Entries with an active block are kept so that is_blocked() and
        remaining_block_seconds() continue to work until the block expires.

    Sliding window store (_sliding_store):
      - First evicts individual timestamps older than 1 hour from every entry
        (regardless of whether the entry itself will be deleted), so stale
        request history doesn't accumulate for keys that went quiet.
      - Then removes the entire entry if the key hasn't been seen for
        _STALE_ENTRY_TTL seconds.

    Called by the background cleanup thread every _CLEANUP_INTERVAL seconds.
    """
    # Capture a single timestamp for the entire cleanup pass so that
    # expiry decisions are consistent across both stores.
    now = _now()
    cutoff = now - _STALE_ENTRY_TTL

    # 1. Auth failure store
    with _lock:
        stale = [
            key for key, entry in _store.items()
            if entry.get("last_seen", 0) < cutoff
            and not ((entry.get("blocked_until") or 0) > now)
        ]
        for key in stale:
            del _store[key]

    if stale:
        logger.debug("Rate limiter cleanup: removed %d stale entries", len(stale))

    # 2. Sliding window store
    with _sliding_lock:
        stale_sliding = []
        for key, entry in _sliding_store.items():
            if entry.get("timestamps"):
                entry["timestamps"] = [t for t in entry["timestamps"] if t > now - 3600]

            if entry.get("last_seen", 0) < cutoff:
                stale_sliding.append(key)

        for key in stale_sliding:
            del _sliding_store[key]

    if stale_sliding:
        logger.debug("Rate limiter cleanup: removed %d stale sliding window entries", len(stale_sliding))


def _cleanup_loop() -> None:
    """Background loop that periodically sweeps stale entries."""
    logger.info("Starting rate limiter cleanup thread")
    while True:
        try:
            time.sleep(_CLEANUP_INTERVAL)
            _cleanup_stale_entries()
        except Exception as e:
            logger.error("Rate limiter cleanup error: %s", e)


# The cleanup thread is started explicitly via start_cleanup(), which is called
# from main.py lifespan. It is NOT started at module import time so that test
# files can import rate_limiter without spinning up background threads and
# causing flaky test failures or resource leaks between test runs.
_cleanup_thread: threading.Thread | None = None


def start_cleanup() -> None:
    """
    Start the rate-limiter background cleanup thread.

    Must be called exactly once, from the application lifespan (main.py).
    Calling it more than once is safe - subsequent calls are no-ops because
    the thread is already alive.

    Why not start at import time?
      If the cleanup thread starts on import, every test that does
      [from rate_limiter import record_failure] also gets a daemon thread.
      Over a test suite of 50+ tests this can cause:
        - Spurious log output between test cases
        - Entries being cleaned up mid-test, making assertions non-deterministic
        - Slower test startup (thread init overhead per worker)
    """
    global _cleanup_thread
    if _cleanup_thread is not None and _cleanup_thread.is_alive():
        return
    _cleanup_thread = threading.Thread(
        target=_cleanup_loop, daemon=True, name="rate-limiter-cleanup"
    )
    _cleanup_thread.start()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def is_blocked(key: str) -> bool:
    """
    Check whether a key (IP or username) is currently blocked.

    Uses a single _now() snapshot to avoid a race between the active-block
    check and the expiry-reset check within the same lock acquisition.
    If the block has expired, removes the entry so the key starts fresh.
    """
    with _lock:
        entry = _store.get(key)
        if not entry:
            return False

        blocked_until: float | None = entry.get("blocked_until")
        now = _now()

        if blocked_until and now < blocked_until:
            return True  # Block is still active

        # Block has expired - clean up so the key gets a fresh start
        if blocked_until and now >= blocked_until:
            logger.info("Rate limiter: block for key %r has expired, resetting counter", key)
            _store.pop(key, None)

        return False


def remaining_block_seconds(key: str) -> int:
    """
    Return the number of seconds remaining in an active block.

    Returns 0 if the key is not blocked or the block has already expired.
    Intended for external callers (e.g. to populate a Retry-After header);
    not used internally — block checks go through _check_and_record_failure().
    """
    with _lock:
        entry = _store.get(key)
        if not entry:
            return 0

        blocked_until: float | None = entry.get("blocked_until")
        if blocked_until:
            return max(0, int(blocked_until - _now()))

        return 0


def _check_and_record_failure(key: str) -> tuple[bool, bool]:
    """
    Atomically check whether a key is blocked and, if not, record a failure.

    This combines the previously separate is_blocked() + record_failure() calls
    into a single lock acquisition, eliminating the race condition where two
    concurrent requests could both pass the check before either triggers a block.

    Returns:
        (was_blocked, newly_blocked)
        was_blocked   - True if the key was already blocked before this call.
        newly_blocked - True if this failure pushed the key over the threshold.
    """
    with _lock:
        now = _now()
        entry = _store.get(key)

        # Check for active block first
        if entry:
            blocked_until: float | None = entry.get("blocked_until")
            if blocked_until and now < blocked_until:
                return True, False  # Already blocked
            # Expired block - reset
            if blocked_until and now >= blocked_until:
                logger.info("Rate limiter: block for key %r has expired, resetting counter", key)
                _store.pop(key, None)
                entry = None

        # Record the failure
        if entry is None:
            entry = _store.setdefault(key, {"failures": 0, "blocked_until": None, "last_seen": now})

        entry["failures"] += 1
        entry["last_seen"] = now
        failures = entry["failures"]

        logger.warning(
            "Rate limiter: failed auth attempt for key %r (%d / %d)",
            key, failures, RT_MAX_FAILURES,
        )

        # Trigger block only once - don't overwrite an existing blocked_until
        if failures >= RT_MAX_FAILURES and not entry["blocked_until"]:
            entry["blocked_until"] = now + RT_BLOCK_DURATION
            logger.warning(
                "Rate limiter: key %r is now blocked for %d seconds "
                "after %d consecutive failed attempts",
                key, RT_BLOCK_DURATION, failures,
            )
            return False, True

        return False, False


def record_failure(key: str) -> bool:
    """
    Record a failed authentication attempt for the given key (IP or username).

    Delegates to _check_and_record_failure() for an atomic check-and-increment.
    If the key is already blocked, the call is a no-op (counter is not
    incremented a second time while a block is active) and returns False.

    Otherwise increments the failure counter. If the counter reaches
    RT_MAX_FAILURES, the key is blocked for RT_BLOCK_DURATION
    seconds and True is returned.

    Returns:
        True  - if this failure triggered a new block.
        False - if the key was already blocked, or is counted but not yet blocked.
    """
    _, newly_blocked = _check_and_record_failure(key)
    return newly_blocked


def record_success(key: str) -> None:
    """
    Remove the failure entry for a key (IP or username) after a successful
    authentication, giving it a clean slate regardless of how many failures
    were recorded.
    """
    with _lock:
        if key in _store:
            logger.info("Rate limiter: successful auth for key %r - counter cleared", key)
            _store.pop(key, None)


# ---------------------------------------------------------------------------
# Sliding-window rate limiter
# ---------------------------------------------------------------------------

class _SlidingWindowEntry(TypedDict):
    timestamps: list   # list[float] - monotonic timestamps of recent requests
    last_seen:  float

_sliding_store: dict[str, _SlidingWindowEntry] = {}
_sliding_lock = threading.Lock()


def _check_rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    """
    Sliding-window request rate limiter. Returns True if the request is allowed,
    False if the key has exceeded [limit] requests within the last [window_seconds].
    Unlike the auth failure tracker, this counts all requests (not just failures).
    Intended for public endpoints like registration where volume itself is the risk.

    The key should include both the endpoint and the IP address so that limits
    are tracked independently per endpoint.
    """
    with _sliding_lock:
        now    = _now()
        cutoff = now - window_seconds
        entry  = _sliding_store.setdefault(key, {"timestamps": [], "last_seen": now})

        # Evict timestamps outside the current window
        entry["timestamps"] = [t for t in entry["timestamps"] if t > cutoff]
        entry["last_seen"]  = now

        if len(entry["timestamps"]) >= limit:
            logger.warning(
                "Rate limit exceeded for key %r (%d/%d requests in %ds window)",
                key, len(entry["timestamps"]), limit, window_seconds,
            )
            return False

        entry["timestamps"].append(now)
        return True


def rate_limit(limit: int, window_seconds: int, endpoint_key: str = ""):
    """
    FastAPI dependency factory for sliding-window rate limiting.
    Wraps _check_rate_limit() as a reusable Depends()-compatible callable.
    Raises HTTP 429 with a Retry-After header if the limit is exceeded.

    Each (endpoint, IP) pair is tracked independently, so limits on one
    endpoint do not affect other endpoints for the same IP.

    Not intended for admin endpoints — admins are trusted actors and
    rate limiting them risks locking out legitimate administrators.

    endpoint_key:   Optional explicit key for the endpoint. If omitted,
                    request.url.path is used automatically.
    """
    def _dep(request: Request) -> None:
        if request.client is None:
            raise HTTPException(
                status_code = 403,
                detail      = "Cannot determine client IP",
            )
        key = f"{endpoint_key or request.url.path}:{request.client.host}"
        if not _check_rate_limit(key, limit, window_seconds):
            raise HTTPException(
                status_code = 429,
                detail      = "Too many requests. Please slow down.",
                headers     = {"Retry-After": str(window_seconds)},
            )

    return Depends(_dep)