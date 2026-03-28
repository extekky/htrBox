"""
config.py - Single source of truth for all configuration.

All values are loaded from environment variables (typically via .env + Docker).
The module fails fast at startup if any required variable is missing,
so misconfiguration is caught immediately rather than at request time.

Required variables (no default, service won't start without them):
  ADMIN_USERNAME       - Username for the initial admin account (first-run seed only)
  ADMIN_PASSWORD       - Password for the initial admin account (first-run seed only)
  HYSTERIA_AUTH        - Authorization header value for Hysteria API calls
  JWT_SECRET           - Secret key for signing JWT tokens (min 32 chars required)

Optional variables (have safe defaults):
  DATABASE_URL               - PostgreSQL DSN                  (default: postgresql://vpn:vpn@localhost:5432/vpn)
  ALLOWED_ORIGINS            - Comma-separated CORS origins    (default: http://localhost:80)
  TRAFFIC_POLL_INTERVAL      - Seconds between traffic polls   (default: 30)
  TRAFFIC_BUCKET_SECONDS     - Traffic bucket size in seconds  (default: 300)
  TRAFFIC_RETENTION_DAYS     - Days to keep traffic_5m rows    (default: 7)
  MAINTENANCE_INTERVAL       - Seconds between maintenance runs (default: 600)
  LOG_LEVEL                  - Logging level                   (default: INFO)
  JWT_ACCESS_TTL_MINUTES     - Access token lifetime in minutes  (default: 30)
  JWT_REFRESH_TTL_DAYS       - Refresh token lifetime in days    (default: 30)
  JWT_ALGORITHM              - JWT signing algorithm             (default: HS256)
  COOKIE_SECURE              - Set Secure flag on cookies        (default: true)
  COOKIE_SAMESITE            - SameSite policy for cookies       (default: strict)
                               Use lax or none only if you have a specific reason.

Rate limiting variables (all optional):
 
  RT_MAX_FAILURES / RT_BLOCK_DURATION — brute-force protection: block IP after
  N consecutive auth failures for BLOCK_DURATION seconds.
 
  RT_<ENDPOINT>_REQ / RT_<ENDPOINT>_WIN — per-endpoint sliding-window caps:
  max REQ requests per WIN seconds.
"""

import os
import logging
from typing import cast, Literal

logger = logging.getLogger(__name__)

SameSiteType = Literal["lax", "strict", "none"]

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _require(name: str) -> str:
    """Load a required env variable. Raises ValueError at startup if missing."""
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(
            f"Required environment variable '{name}' is not set. "
            f"Please add it to your .env file."
        )
    return value


def _require_min_length(name: str, min_length: int) -> str:
    """Load a required env variable and enforce a minimum length.

    Used for secrets where a short value is a security misconfiguration,
    not just a missing value — we want a loud startup failure rather than
    silently accepting a weak secret and compromising all issued tokens.
    """
    value = _require(name)
    if len(value) < min_length:
        raise ValueError(
            f"Environment variable '{name}' is too short "
            f"(got {len(value)} chars, need at least {min_length}). "
            f"Generate a strong secret with: openssl rand -hex 32"
        )
    return value


def _optional(name: str, default: str) -> str:
    """Load an optional env variable with a fallback default."""
    return os.getenv(name, default).strip()


def _optional_int(name: str, default: int) -> int:
    """Load an optional integer env variable with a fallback default."""
    try:
        return int(os.getenv(name, str(default)))
    except (ValueError, TypeError):
        return default


def _optional_bool(name: str, default: bool) -> bool:
    """Load an optional boolean env variable. Accepts true/false/1/0 (case-insensitive)."""
    raw = os.getenv(name, "").strip().lower()
    if raw in ("true", "1", "yes"):
        return True
    if raw in ("false", "0", "no"):
        return False
    return default


def _optional_samesite(key: str, default: SameSiteType) -> SameSiteType:
    val = os.getenv(key, default).lower()
    if val not in ("lax", "strict", "none"):
        raise ValueError(f"{key} must be 'lax', 'strict' or 'none', got {val!r}")
    return cast(SameSiteType, val)


# ---------------------------------------------------------------------------
# Database (PostgreSQL)
# ---------------------------------------------------------------------------

DATABASE_URL = _optional(
    "DATABASE_URL",
    "postgresql://vpn:vpn@localhost:5432/vpn",
)


# ---------------------------------------------------------------------------
# Initial admin seed
# Used only once at first startup to create the first admin account.
# After the account is created, these values are no longer read at runtime.
# ---------------------------------------------------------------------------

ADMIN_USERNAME = _require("ADMIN_USERNAME")
ADMIN_PASSWORD = _require("ADMIN_PASSWORD")


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

JWT_SECRET             = _require_min_length("JWT_SECRET", 32)
JWT_ALGORITHM          = _optional("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TTL_MINUTES = _optional_int("JWT_ACCESS_TTL_MINUTES", 30)
JWT_REFRESH_TTL_DAYS   = _optional_int("JWT_REFRESH_TTL_DAYS", 30)


# ---------------------------------------------------------------------------
# Cookies
# ---------------------------------------------------------------------------

COOKIE_SECURE    = _optional_bool("COOKIE_SECURE", True)
COOKIE_SAMESITE = _optional_samesite("COOKIE_SAMESITE", "strict")


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

ALLOWED_ORIGINS: list[str] = [
    o.strip().strip("'\"")
    for o in _optional("ALLOWED_ORIGINS", "http://localhost:80").split(",")
    if o.strip()
]


# ---------------------------------------------------------------------------
# Hysteria API
# ---------------------------------------------------------------------------

# Authorization header value sent to every Hysteria API request
HYSTERIA_AUTH = _require("HYSTERIA_AUTH")


# ---------------------------------------------------------------------------
# Traffic collector
# ---------------------------------------------------------------------------

TRAFFIC_POLL_INTERVAL  = _optional_int("TRAFFIC_POLL_INTERVAL", 30)
TRAFFIC_BUCKET_SECONDS = _optional_int("TRAFFIC_BUCKET_SECONDS", 300)
TRAFFIC_RETENTION_DAYS = _optional_int("TRAFFIC_RETENTION_DAYS", 7)
MAINTENANCE_INTERVAL   = _optional_int("MAINTENANCE_INTERVAL", 600)   # 10 minutes


# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------

# Brute-force protection: counts consecutive auth failures per IP.
# After RT_MAX_FAILURES failed attempts the IP is blocked for RT_BLOCK_DURATION seconds.
RT_MAX_FAILURES   = _optional_int("RT_MAX_FAILURES", 3)
RT_BLOCK_DURATION = _optional_int("RT_BLOCK_DURATION", 180)
 
# Per-endpoint sliding-window caps: _REQ = max requests, _WIN = window in seconds.
RT_LOGIN_REQ = _optional_int("RT_LOGIN_REQ", 10)
RT_LOGIN_WIN = _optional_int("RT_LOGIN_WIN", 60)

RT_REFRESH_REQ = _optional_int("RT_REFRESH_REQ", 30)
RT_REFRESH_WIN = _optional_int("RT_REFRESH_WIN", 60)

RT_REGISTER_REQ = _optional_int("RT_REGISTER_REQ", 5)
RT_REGISTER_WIN = _optional_int("RT_REGISTER_WIN", 60)

RT_SERVERS_REQ = _optional_int("RT_SERVERS_REQ", 30)
RT_SERVERS_WIN = _optional_int("RT_SERVERS_WIN", 60)

RT_CHANGE_PASSWORD_REQ = _optional_int("RT_CHANGE_PASSWORD_REQ", 3)
RT_CHANGE_PASSWORD_WIN = _optional_int("RT_CHANGE_PASSWORD_WIN", 300)

RT_GENERATE_URL_REQ =  _optional_int("RT_GENERATE_URL_REQ", 30)
RT_GENERATE_URL_WIN =  _optional_int("RT_GENERATE_URL_WIN", 60)

RT_REGENERATE_HY_REQ = _optional_int("RT_REGENERATE_HY_REQ", 5)
RT_REGENERATE_HY_WIN = _optional_int("RT_REGENERATE_HY_WIN", 60)

RT_TRAFFIC_REQ = _optional_int("RT_TRAFFIC_REQ", 30)
RT_TRAFFIC_WIN = _optional_int("RT_TRAFFIC_WIN", 60)

RT_HEALTH_REQ = _optional_int("RT_HEALTH_REQ", 10)
RT_HEALTH_WIN = _optional_int("RT_HEALTH_WIN", 60)

RT_ME_REQ = _optional_int("RT_ME_REQ", 30)
RT_ME_WIN = _optional_int("RT_ME_WIN", 60)


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

LOG_LEVEL = _optional("LOG_LEVEL", "INFO").upper()


# ---------------------------------------------------------------------------
# API docs
# ---------------------------------------------------------------------------

# Expose /docs and /redoc only when explicitly enabled.
DOCS_ENABLED: bool = _optional_bool("DOCS_ENABLED", False)