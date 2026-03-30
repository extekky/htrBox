"""
Users router - user account management and self-service endpoints.

Endpoints:
  GET    /users                             - list all users  (admin)
  POST   /users                             - create a user   (admin)
  POST   /users/register                    - public self-registration (rate limited)
  GET    /users/me                          - current user info   (any authenticated user)
  PUT    /users/{username}                  - update user fields      (admin)
  DELETE /users/{username}                  - delete user             (admin)
  POST   /users/{username}/set-role         - change user role        (admin)
  POST   /users/{username}/regenerate-hy    - regenerate hyPassword   (admin or self)
  POST   /users/{username}/change-password  - change account password (admin or self)

NOTE:
  All admin-only endpoints use Depends(require_admin) which reads the role
  from the database on every request. Changing a user's role takes effect
  immediately on the next request — no token re-issue needed.
"""

import logging

import psycopg2.errors
from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException,
)

from database import get_db
from rate_limiter import rate_limit
from config import (
    RT_REGISTER_REQ, 
    RT_REGISTER_WIN, 
    RT_CHANGE_PASSWORD_REQ, 
    RT_CHANGE_PASSWORD_WIN,
    RT_REGENERATE_HY_REQ,
    RT_REGENERATE_HY_WIN,
    RT_ME_REQ,
    RT_ME_WIN,
)
from routers.deps import DICT_CURSOR
from schemas import (
    ChangePasswordRequest, ChangePasswordResponse,
    CreateUserRequest, CreateUserResponse,
    DeleteUserResponse, RegisterUserRequest, RegisterResponse,
    RegenerateHyResponse, SetRoleRequest, SetRoleResponse,
    UpdateUserRequest, UpdateUserResponse, UserResponse, UserRow, UserSessionInfo,
)
from utils import (
    generate_hy_password, 
    hash_password, 
    verify_password,
)
from auth_jwt import (
    UserTokenData, 
    get_current_user, 
    require_user, 
    require_admin, 
    revoke_all_user_tokens
)

router = APIRouter(prefix="/users")
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# GET /users  - list all users (admin)
# ---------------------------------------------------------------------------

@router.get("", response_model=list[UserResponse])
def list_users(_: object = Depends(require_admin)):
    """Return all users with their current state. Admin only."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute(
                'SELECT username, role, allowed, "usedTraffic", active, expires_at FROM users'
            )
            rows = cur.fetchall()

    return [
        UserResponse(
            username    = r["username"],
            role        = r["role"],
            allowed     = bool(r["allowed"]),
            usedTraffic = r["usedTraffic"],
            active      = bool(r["active"]),
            expires_at  = r["expires_at"],
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# POST /users  - create a user (admin)
# ---------------------------------------------------------------------------

@router.post("", response_model=CreateUserResponse)
def create_user(
    body: CreateUserRequest,
    _: object = Depends(require_admin),
):
    """
    Create a new VPN user. Admin only.
    Generates a random hyPassword automatically.
    New users are created with role='user' - use /set-role to change.
    """
    hy_password = generate_hy_password()

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    'INSERT INTO users (username, password, "hyPassword", allowed, "usedTraffic", active, expires_at, role) '
                    "VALUES (%s, %s, %s, %s, 0, %s, %s, 'user')",
                    (body.username, hash_password(body.password), hy_password, body.allowed, body.active, body.expires_at),
                )
            conn.commit()
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(409, "Username already exists")

    logger.info("User created: %r (allowed=%s active=%s)", body.username, body.allowed, body.active)

    return CreateUserResponse(
        username   = body.username,
        hyPassword = hy_password,
    )


# ---------------------------------------------------------------------------
# POST /users/register  - public self-registration (rate limited)
# ---------------------------------------------------------------------------

@router.post(
        "/register", 
        response_model=RegisterResponse, 
        dependencies=[rate_limit(
            RT_REGISTER_REQ, 
            RT_REGISTER_WIN,
        )]
)
def register_user(body: RegisterUserRequest):
    """
    Public registration endpoint.
    Creates a user with allowed=1, active=0 — subscription inactive until paid.
    """
    hy_password = generate_hy_password()
    logger.info("New registration attempt: username=%r", body.username)
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    'INSERT INTO users (username, password, "hyPassword", allowed, "usedTraffic", active, role) '
                    "VALUES (%s, %s, %s, TRUE, 0, FALSE, 'user')",
                    (body.username, hash_password(body.password), hy_password),
                )
            conn.commit()
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(409, "Username already exists")

    logger.info("User registered: username=%r", body.username)

    return RegisterResponse(
        username = body.username,
        message  = "Registered successfully",
    )


# ---------------------------------------------------------------------------
# GET /users/me  - current user info
# ---------------------------------------------------------------------------

@router.get(
        "/me", 
        response_model=UserSessionInfo, 
        dependencies=[rate_limit(
            RT_ME_REQ, 
            RT_ME_WIN
        )]
)
def get_me(user_row=Depends(require_user)):
    """
    Return the current user's profile data.
    Available to any authenticated, active user (both admin and user roles).
    require_user already fetched the DB row — we return it directly.
    """

    return UserSessionInfo(
        username    = user_row["username"],
        role        = user_row["role"],
        allowed     = bool(user_row["allowed"]),
        active      = bool(user_row["active"]),
        usedTraffic = user_row["usedTraffic"],
        expires_at  = user_row["expires_at"],
    )


# ---------------------------------------------------------------------------
# PUT /users/{username}  - update user fields (admin)
# ---------------------------------------------------------------------------

@router.put("/{username}", response_model=UpdateUserResponse)
def update_user(
    username: str,
    body: UpdateUserRequest,
    admin_row: UserRow = Depends(require_admin),
):
    """
    Update one or more fields on an existing user. Admin only.
    Fields: allowed, password, active, expires_at.

    NOTE: username is immutable; role cannot be changed via this endpoint.
    Use /set-role to change a user's role.
    Editing any field of an admin account is forbidden.
    """
    updates, params = [], []
    if body.allowed    is not None: updates.append("allowed = %s");    params.append(bool(body.allowed))
    if body.password   is not None: updates.append("password = %s");   params.append(hash_password(body.password))
    if body.active     is not None: updates.append("active = %s");     params.append(bool(body.active))
    if body.expires_at is not None: updates.append("expires_at = %s"); params.append(body.expires_at)

    if not updates:
        raise HTTPException(400, "Nothing to update")

    try:
        params.append(username)
        with get_db() as conn:
            with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
                # Guard: forbid editing admin accounts.
                cur.execute("SELECT role FROM users WHERE username = %s", (username,))
                target = cur.fetchone()
                if not target:
                    raise HTTPException(404, "User not found")
                if target["role"] == "admin":
                    # Admins can only change their own password, nothing else.
                    non_password_updates = [
                        f for f in ("allowed", "active", "expires_at") if getattr(body, f) is not None
                    ]
                    if non_password_updates:
                        raise HTTPException(403, "Cannot edit an admin account")
                    if body.password is None:
                        raise HTTPException(403, "Cannot edit an admin account")
                    if username != admin_row["username"]:
                        raise HTTPException(403, "Cannot change another admin's password")

                cur.execute(f"UPDATE users SET {', '.join(updates)} WHERE username = %s", params)
            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error updating user %r: %s", username, e)
        raise HTTPException(500, "Internal server error")

    updated_fields = [f for f in ("allowed", "password", "active", "expires_at") if getattr(body, f) is not None]
    logger.info("User updated: %r (fields: %s) (by admin %r)", username, updated_fields, admin_row["username"])

    return UpdateUserResponse(
        status = "updated",
    )


# ---------------------------------------------------------------------------
# DELETE /users/{username}  - delete user (admin)
# ---------------------------------------------------------------------------

@router.delete("/{username}", response_model=DeleteUserResponse)
def delete_user(
    username: str,
    admin_row: UserRow = Depends(require_admin),
):
    """
    Delete a user and all their data. Admin only.

    Guard: cannot delete yourself (prevents accidental self-lockout).
    Guard: cannot delete the last admin account.
    """
    if username == admin_row["username"]:
        raise HTTPException(400, "Cannot delete your own account")

    with get_db() as conn:
        try:
            with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
                # Step 1: lock the target row.
                cur.execute(
                    "SELECT role FROM users WHERE username = %s FOR UPDATE",
                    (username,),
                )
                target = cur.fetchone()
                if not target:
                    raise HTTPException(404, "User not found")

                # Step 2: if target is an admin, lock ALL admin rows to prevent
                # the race condition where two concurrent requests both see
                # admin_count > 1 and both proceed to delete.
                # NOTE: FOR UPDATE cannot be used with aggregate functions,
                # so we lock the rows first and count them in Python.
                if target["role"] == "admin":
                    cur.execute(
                        "SELECT username FROM users WHERE role = 'admin' FOR UPDATE",
                    )
                    admin_rows = cur.fetchall()
                    if len(admin_rows) <= 1:
                        raise HTTPException(400, "Cannot delete the last admin account")

            # DELETE first, revoke tokens after — so that if DELETE fails,
            # tokens are not revoked for a user that still exists.
            with conn.cursor() as cur:
                cur.execute("DELETE FROM users WHERE username = %s", (username,))

            revoke_all_user_tokens(username, conn)
            conn.commit()

        except HTTPException:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise

    logger.info("User deleted: %r (by admin %r)", username, admin_row["username"])

    return DeleteUserResponse(
        status = "deleted",
    )


# ---------------------------------------------------------------------------
# POST /users/{username}/set-role  - change user role (admin)
# ---------------------------------------------------------------------------

@router.post("/{username}/set-role", response_model=SetRoleResponse)
def set_role(
    username: str,
    body: SetRoleRequest,
    admin_row: UserRow = Depends(require_admin),
):
    """
    Change a user's role. Admin only.

    Guard: cannot change your own role (prevents accidental self-demotion).
    Guard: cannot demote the last admin.

    Role change takes effect immediately — the user's next request will
    be evaluated against the new role without requiring re-login.

    When promoting to admin: allowed, active are set to TRUE, expires_at to NULL.
    When demoting to user: active is set to FALSE (subscription inactive until re-activates).
    """
    if username == admin_row["username"]:
        raise HTTPException(400, "Cannot change your own role")

    with get_db() as conn:
        try:
            with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
                # Step 1: lock the target row.
                cur.execute(
                    "SELECT role FROM users WHERE username = %s FOR UPDATE",
                    (username,),
                )
                target = cur.fetchone()
                if not target:
                    raise HTTPException(404, "User not found")

                # Step 2: if demoting an admin, lock ALL admin rows to prevent
                # the race condition where two concurrent requests both see
                # admin_count > 1 and both proceed to demote.
                # NOTE: FOR UPDATE cannot be used with aggregate functions,
                # so we lock the rows first and count them in Python.
                if target["role"] == "admin" and body.role != "admin":
                    cur.execute(
                        "SELECT username FROM users WHERE role = 'admin' FOR UPDATE",
                    )
                    admin_rows = cur.fetchall()
                    if len(admin_rows) <= 1:
                        raise HTTPException(400, "Cannot demote the last admin account")

            with conn.cursor() as cur:
                if body.role == "admin":
                    cur.execute(
                        "UPDATE users SET role = 'admin', allowed = TRUE, active = TRUE, expires_at = NULL "
                        "WHERE username = %s",
                        (username,),
                    )
                else:
                    cur.execute(
                        "UPDATE users SET role = %s, active = FALSE WHERE username = %s",
                        (body.role, username),
                    )
            conn.commit()
        
        except HTTPException:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise

    logger.info(
        "Role changed: %r -> %r (by admin %r)",
        username, body.role, admin_row["username"],
    )

    return SetRoleResponse(
        username = username,
        role     = body.role,
    )


# ---------------------------------------------------------------------------
# POST /users/{username}/regenerate-hy
# ---------------------------------------------------------------------------

@router.post(
        "/{username}/regenerate-hy", 
        response_model=RegenerateHyResponse,
        dependencies=[rate_limit(
            RT_REGENERATE_HY_REQ,
            RT_REGENERATE_HY_WIN,
        )]
)
def regenerate_hy(
    username: str,
    current_user: UserTokenData = Depends(get_current_user),
):
    """
    Generate a new random hyPassword for the user's Hysteria connection.
    Admins can regenerate any user's password; regular users only their own.
    """
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute("SELECT role FROM users WHERE username = %s", (current_user.username,))
            caller_row = cur.fetchone()
        if not caller_row:
            raise HTTPException(401, "User no longer exists")

        caller_is_admin = caller_row["role"] == "admin"

        if not caller_is_admin and current_user.username != username:
            raise HTTPException(403, "Cannot regenerate another user's password")

        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute("SELECT username FROM users WHERE username = %s", (username,))
            target = cur.fetchone()
        if not target:
            raise HTTPException(404, "User not found")

        hy_password = generate_hy_password()
        with conn.cursor() as cur:
            cur.execute('UPDATE users SET "hyPassword" = %s WHERE username = %s', (hy_password, username))
        conn.commit()

    logger.info("hyPassword regenerated for user %r by %r", username, current_user.username)

    return RegenerateHyResponse(
        username   = username, 
        hyPassword = hy_password,
    )


# ---------------------------------------------------------------------------
# POST /users/{username}/change-password
# ---------------------------------------------------------------------------

@router.post(
        "/{username}/change-password", 
        response_model=ChangePasswordResponse, 
        dependencies=[rate_limit(
            RT_CHANGE_PASSWORD_REQ, 
            RT_CHANGE_PASSWORD_WIN,
        )]
)
def change_password(
    username: str,
    body: ChangePasswordRequest,
    current_user: UserTokenData = Depends(get_current_user),
):
    """
    Change the user's account password.

    Admins can change any user's password without providing the old one.
    Regular users can only change their own and must provide the current one.

    If apply_hy=true, also updates hyPassword to the new plain-text value.
    On password change all existing refresh tokens for that user are revoked.
    """
    with get_db() as conn:
        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute("SELECT role FROM users WHERE username = %s", (current_user.username,))
            caller_row = cur.fetchone()
        if not caller_row:
            raise HTTPException(401, "User no longer exists")

        caller_is_admin = caller_row["role"] == "admin"

        if not caller_is_admin and current_user.username != username:
            raise HTTPException(403, "Cannot change another user's password")

        with conn.cursor(cursor_factory=DICT_CURSOR) as cur:
            cur.execute("SELECT password FROM users WHERE username = %s", (username,))
            target = cur.fetchone()
        if not target:
            raise HTTPException(404, "User not found")

        if not caller_is_admin:
            if body.password is None:
                raise HTTPException(422, "Current password is required")
            if not verify_password(body.password, target["password"]):
                raise HTTPException(401, "Current password is incorrect")

        with conn.cursor() as cur:
            if body.apply_hy:
                cur.execute(
                    'UPDATE users SET password = %s, "hyPassword" = %s WHERE username = %s',
                    (hash_password(body.new_password), body.new_password, username),
                )
            else:
                cur.execute(
                    "UPDATE users SET password = %s WHERE username = %s",
                    (hash_password(body.new_password), username),
                )
            if cur.rowcount == 0:
                raise HTTPException(500, "Failed to update password")

        revoke_all_user_tokens(username, conn)
        conn.commit()

    logger.info(
        "Password changed for user %r by %r (apply_hy=%s)",
        username, current_user.username, body.apply_hy,
    )

    return ChangePasswordResponse(
        username = username,
        status   = "password_changed",
    )