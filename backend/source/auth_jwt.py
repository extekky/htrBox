"""
auth_jwt.py - JWT token creation, validation, and FastAPI dependencies.

Two-token scheme:
  - Access token  (JWT, short-lived ~30 min) - sent as Authorization: Bearer header.
                  Contains: username, exp. Stateless - no DB lookup for basic auth.
  - Refresh token (JWT, long-lived ~30 days) - stored in HttpOnly Secure cookie.
                  Validated against the refresh_tokens table in DB so it can be
                  revoked server-side (logout, password change, admin actions).

Role model:
  Roles are stored in the DB only and never embedded in the JWT payload.
  This means a role change takes effect immediately on the next request
  without waiting for the access token to expire.

  Two roles: 'admin' | 'user'

Refresh token storage:
  Tokens are stored as SHA-256 hashes in the DB. The plain-text value is only
  ever held in memory and sent once as a cookie - it never touches the DB.

Public API:
  create_access_token(username)          -> signed JWT string
  create_refresh_token(username, conn)   -> opaque token string + saves hash to DB
  revoke_refresh_token(token_str, conn)  -> deletes from DB
  revoke_all_user_tokens(username, conn) -> deletes all user's refresh tokens

FastAPI dependencies (use with Depends()):
  get_current_user() -> UserTokenData  - validates JWT, no DB hit, raises 401
  require_user()     -> UserRow        - DB check: exists, allowed, active
  require_admin()    -> UserRow        - require_user + role == 'admin'
  optional_user()    -> UserTokenData | None - does not raise if token missing
"""

import hashlib
import logging
import secrets
from dataclasses import dataclass
from typing import cast
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, Header, HTTPException
from jwt import ExpiredSignatureError, InvalidTokenError

import psycopg2.extras

from config import (
    JWT_ACCESS_TTL_MINUTES,
    JWT_ALGORITHM,
    JWT_REFRESH_TTL_DAYS,
    JWT_SECRET,
)
from database import get_db
from schemas import UserRow

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data model returned by stateless JWT dependency (no DB)
# ---------------------------------------------------------------------------

@dataclass
class UserTokenData:
    """Minimal data extracted from a validated access token. No DB lookup."""
    username: str


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _hash_token(token_value: str) -> str:
    """Return the SHA-256 hex digest of a refresh token value."""
    return hashlib.sha256(token_value.encode()).hexdigest()


def _extract_bearer(authorization: str | None) -> str | None:
    """Extract the token string from an Authorization: Bearer <token> header."""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.
    Raises HTTPException(401) on any failure.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except InvalidTokenError as e:
        logger.warning("Invalid JWT token: %s", e)
        raise HTTPException(401, "Invalid token")

    if payload.get("type") != "access":
        raise HTTPException(401, "Wrong token type")

    return payload


# ---------------------------------------------------------------------------
# Token creation
# ---------------------------------------------------------------------------

def create_access_token(username: str) -> str:
    """
    Create a short-lived signed JWT access token.

    Payload fields:
      sub  - subject (username)
      exp  - expiry timestamp
      iat  - issued-at timestamp
      type - "access" (used to reject refresh tokens presented as access tokens)
      jti  - unique ID (prevents identical tokens issued in the same second)

    NOTE: role is intentionally NOT in the token. It is read from the DB on
    every request that needs it, so role changes take effect immediately.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub":  username,
        "exp":  now + timedelta(minutes=JWT_ACCESS_TTL_MINUTES),
        "iat":  now,
        "type": "access",
        "jti":  secrets.token_hex(8),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(username: str, conn) -> str:
    """
    Create a long-lived refresh token and persist its SHA-256 hash in the DB.

    Only the SHA-256 hash is written to the DB - the plain-text value is
    returned to the caller to be set as a cookie and never stored anywhere.

    Returns the plain-text token to be set as a cookie.
    """
    token_value = secrets.token_urlsafe(48)
    token_hash  = _hash_token(token_value)
    expires_at  = datetime.now(timezone.utc) + timedelta(days=JWT_REFRESH_TTL_DAYS)

    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO refresh_tokens (token, username, expires_at) VALUES (%s, %s, %s)",
            (token_hash, username, expires_at),
        )
    return token_value


def revoke_refresh_token(token_value: str, conn) -> None:
    """Delete a specific refresh token from the DB (used on logout)."""
    token_hash = _hash_token(token_value)
    with conn.cursor() as cur:
        cur.execute("DELETE FROM refresh_tokens WHERE token = %s", (token_hash,))


def revoke_all_user_tokens(username: str, conn) -> None:
    """
    Revoke every refresh token for a user.
    Call this on password change or when an admin disables a user.
    """
    with conn.cursor() as cur:
        cur.execute("DELETE FROM refresh_tokens WHERE username = %s", (username,))


# ---------------------------------------------------------------------------
# Refresh token validation (used only in POST /auth/refresh)
# ---------------------------------------------------------------------------

def validate_refresh_token(token_value: str, conn) -> str:
    """
    Look up a refresh token in the DB and return the associated username.

    Raises HTTPException(401) if:
      - Token not found (never existed or already revoked)
      - Token has expired (the expired row is deleted on detection)
    """
    token_hash = _hash_token(token_value)

    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            "SELECT username, expires_at FROM refresh_tokens WHERE token = %s",
            (token_hash,),
        )
        row = cur.fetchone()

    if not row:
        raise HTTPException(401, "Invalid or revoked refresh token")

    # expires_at is TIMESTAMPTZ — psycopg2 returns an aware datetime automatically.
    expires_at = row["expires_at"]
    if expires_at.tzinfo is None:
        # Defensive: should not happen with TIMESTAMPTZ, but guard anyway.
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM refresh_tokens WHERE token = %s", (token_hash,))
        raise HTTPException(401, "Refresh token expired")

    return row["username"]


# ---------------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------------

def get_current_user(
    authorization: str = Header(None),
) -> UserTokenData:
    """
    FastAPI dependency — validates the access token from the Authorization header.
    Stateless: no DB lookup. Returns only the username from the token.

    Raises HTTP 401 if:
      - Header is missing or malformed
      - Token is expired
      - Token signature is invalid
      - Token type is not "access"
    """
    token = _extract_bearer(authorization)
    if not token:
        raise HTTPException(401, "Not authenticated")

    payload = decode_access_token(token)
    username = payload.get("sub")

    if not username:
        raise HTTPException(401, "Invalid token payload")

    return UserTokenData(username=username)


def require_user(
    current_user: UserTokenData = Depends(get_current_user),
) -> UserRow:
    """
    FastAPI dependency — extends get_current_user with a live DB check.

    Verifies the user:
      - still exists in DB
      - is not banned (allowed = 1)
      - subscription has not expired (expires_at is None or in the future)

    If expires_at is in the past, sets active=False in the DB.

    Returns the full DB row so downstream handlers can read any field
    (including role) without an extra query.
    """
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                'SELECT username, allowed, active, role, "usedTraffic", expires_at, statuses '
                "FROM users WHERE username = %s",
                (current_user.username,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(401, "User no longer exists")
    if not row["allowed"]:
        raise HTTPException(403, "Account is banned")

    # Check subscription expiry. If expires_at is set and in the past,
    # mark active=False in the DB so VPN connections are blocked.
    expires_at = row["expires_at"]
    if expires_at is not None:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE users SET active = FALSE WHERE username = %s AND active = TRUE",
                        (row["username"],),
                    )
                conn.commit()
            row = dict(row)
            row["active"] = False

    return cast(UserRow, row)


def require_admin(
    user_row: UserRow = Depends(require_user),
) -> UserRow:
    """
    FastAPI dependency — extends require_user with a role check.

    Raises HTTP 403 if the authenticated user does not have the 'admin' role.
    Returns the same DB row as require_user.
    """
    if user_row["role"] != "admin":
        raise HTTPException(403, "Admin access required")
    return user_row


def optional_user(
    authorization: str = Header(None),
) -> UserTokenData | None:
    """
    FastAPI dependency — like get_current_user but returns None instead of raising
    when no token is present or the token is invalid.
    Useful for endpoints with different behaviour for authenticated vs anonymous users.
    """
    token = _extract_bearer(authorization)
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if not username:
            return None
        return UserTokenData(username=username)
    except HTTPException:
        return None