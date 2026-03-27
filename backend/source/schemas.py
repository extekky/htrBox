"""
schemas.py - Pydantic request and response models.

Centralises all input validation and response shapes so that:
  - Routers declare intent via type annotations instead of manual dict.get() chains
  - FastAPI auto-generates accurate OpenAPI documentation
  - Input constraints (length, pattern, value range) are enforced before handler logic runs

Sections:
  Auth        - login, token, session responses
  Users       - create, update, register, change-password, regenerate-hy, set-role
  Servers     - create, update, public and admin response shapes
  Hysteria    - kick, URL generation response
  Traffic     - time-series bucket responses
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Shared validators
# ---------------------------------------------------------------------------

_USERNAME_PATTERN = r"^[a-zA-Z0-9_-]+$"

# Valid role values
RoleType = Literal["admin", "user"]


def _parse_expires_at(value: str | datetime | None) -> datetime | None:
    """
    Parse an ISO 8601 string (or a datetime) into a UTC-normalised aware datetime.

    Accepts:
      - None                          -> None
      - datetime (already parsed)     -> normalised to UTC
      - "2026-12-31T23:59:59Z"        -> datetime(..., tzinfo=UTC)
      - "2026-12-31T23:59:59+03:00"   -> datetime(..., tzinfo=UTC)  (converted)
      - "2026-12-31T23:59:59"         -> datetime(..., tzinfo=UTC)  (assumed UTC)

    psycopg2 serialises an aware datetime to PostgreSQL with the correct offset,
    so TIMESTAMPTZ stores it unambiguously as UTC regardless of the original input.
    """
    if value is None:
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            raise ValueError("expires_at must be a valid ISO 8601 datetime string")
    # Attach UTC if naive (bare string with no offset)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    """Unified login request for both admin and user."""
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(AccessTokenResponse):
    """Returned on successful login. Includes role so the frontend can adapt its UI."""
    user: "UserSessionInfo"


class UserSessionInfo(BaseModel):
    """Current user's session data — returned by /auth/login and /users/me."""
    username: str
    role: RoleType
    allowed: bool
    active: bool
    usedTraffic: float
    expires_at: datetime | None


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64, pattern=_USERNAME_PATTERN)
    password: str = Field(..., min_length=8, max_length=128)
    allowed: bool = False
    active: bool = False
    expires_at: datetime | None = None

    @field_validator("expires_at", mode="before")
    @classmethod
    def validate_expires_at(cls, v: str | datetime | None) -> datetime | None:
        return _parse_expires_at(v)


class RegisterUserRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64, pattern=_USERNAME_PATTERN)
    password: str = Field(..., min_length=8, max_length=128)


class UpdateUserRequest(BaseModel):
    allowed: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    active: bool | None = None
    expires_at: datetime | None = None

    @field_validator("expires_at", mode="before")
    @classmethod
    def validate_expires_at(cls, v: str | datetime | None) -> datetime | None:
        return _parse_expires_at(v)


class SetRoleRequest(BaseModel):
    """Change a user's role. Admin only."""
    role: RoleType


class ChangePasswordRequest(BaseModel):
    password: str | None = Field(default=None, min_length=1, max_length=128)
    new_password: str    = Field(..., min_length=8, max_length=128)
    apply_hy: bool       = False


class UserResponse(BaseModel):
    """Full user info returned in admin user listings."""
    username: str
    role: RoleType
    allowed: bool
    usedTraffic: float
    active: bool
    expires_at: datetime | None


class CreateUserResponse(BaseModel):
    username: str
    hyPassword: str


class RegenerateHyResponse(BaseModel):
    username: str
    hyPassword: str


class ChangePasswordResponse(BaseModel):
    username: str
    status: str


class RegisterResponse(BaseModel):
    username: str
    message: str


class UpdateUserResponse(BaseModel):
    status: str


class DeleteUserResponse(BaseModel):
    status: str


class SetRoleResponse(BaseModel):
    username: str
    role: RoleType


# ---------------------------------------------------------------------------
# Servers
# ---------------------------------------------------------------------------

class CreateServerRequest(BaseModel):
    country: str  = Field(..., min_length=1, max_length=64)
    city: str     = Field(..., min_length=1, max_length=64)
    ip: str       = Field(..., min_length=1, max_length=255)
    domain: str | None = Field(default=None, max_length=255)
    port: int     = Field(default=443, ge=1, le=65535)
    label: str    = Field(default="VPN", min_length=1, max_length=64)
    protocol: str = Field(default="hysteria2", min_length=1, max_length=32)
    active: bool  = True
    hysteria_url: str | None = Field(default=None, max_length=255)


class UpdateServerRequest(BaseModel):
    country: str | None  = Field(default=None, min_length=1, max_length=64)
    city:    str | None  = Field(default=None, min_length=1, max_length=64)
    ip:      str | None  = Field(default=None, min_length=1, max_length=255)
    domain:  str | None  = Field(default=None, max_length=255)
    port:    int | None  = Field(default=None, ge=1, le=65535)
    label:   str | None  = Field(default=None, min_length=1, max_length=64)
    protocol: str | None = Field(default=None, min_length=1, max_length=32)
    active:   bool | None = None
    hysteria_url: str | None = Field(default=None, max_length=255)


class ServerPublicResponse(BaseModel):
    """Minimal server info returned to unauthenticated clients."""
    id: str
    country: str
    city: str
    active: bool


class ServerAdminResponse(BaseModel):
    """Full server info returned to admins."""
    id: str
    country: str
    city: str
    ip: str
    domain: str | None
    port: int
    label: str
    protocol: str
    hysteria_url: str | None
    active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ServerCreateResponse(BaseModel):
    id: str
    country: str
    city: str
    ip: str
    domain: str | None
    port: int
    label: str
    protocol: str
    hysteria_url: str | None
    active: bool


class DeleteServerResponse(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Hysteria
# ---------------------------------------------------------------------------

class KickUsersRequest(BaseModel):
    usernames: list[str] = Field(..., min_length=1, max_length=100)

    @field_validator("usernames")
    @classmethod
    def usernames_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("usernames list must not be empty")
        for name in v:
            if not name or len(name) > 64:
                raise ValueError("each username must be between 1 and 64 characters")
        return v


class GenerateUrlResponse(BaseModel):
    url: str
    server_id: str
    server_host: str


class KickUsersResponse(BaseModel):
    kicked: list[str]
    blocked_in_db: int
    kick_errors: list[dict] | None = None


class ResetTrafficResponse(BaseModel):
    username: str
    usedTraffic: float


class HysteriaAuthResponse(BaseModel):
    """Response shape for POST /auth — consumed by the Hysteria server."""
    ok: bool
    id: str | None = None   # username on success
    msg: str | None = None  # error message on failure


class StatusResponse(BaseModel):
    """Generic single-field response for operations that only confirm success."""
    status: str


# ---------------------------------------------------------------------------
# Traffic
# ---------------------------------------------------------------------------

class TrafficBucketResponse(BaseModel):
    time: datetime
    delta_gb: float
    server_id: str | None = None


class TrafficServerBucketResponse(BaseModel):
    time: datetime
    delta_gb: float


class TrafficUserTotalResponse(BaseModel):
    username: str
    total_gb: float