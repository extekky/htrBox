"""
utils.py - Shared utility functions used across routers and services.

Provides:
  generate_hy_password()  - generate a random Hysteria client password
  hash_password()         - bcrypt-hash a plaintext password
  verify_password()       - verify a plaintext password against a bcrypt hash

Admin access is enforced via the require_admin() FastAPI dependency
in auth_jwt.py, which reads the role from the database.
"""

import logging
import secrets
import string

import bcrypt

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Password utilities
# ---------------------------------------------------------------------------

def generate_hy_password(length: int = 20) -> str:
    """
    Generate a cryptographically secure random password for Hysteria clients.
    Uses alphanumeric characters only for maximum compatibility.
    """
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt. Returns the hashed string."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    Returns False on any error rather than raising, to keep auth logic clean.
    """
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception as e:
        logger.error("Password verification error: %s", e)
        return False