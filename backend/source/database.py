"""
database.py - Database connection and schema initialization (PostgreSQL).

Provides:
  get_db()  - context-managed psycopg2 connection.
              Rows are accessible by column name via RealDictCursor.
  init_db() - creates all tables and seeds the initial admin on startup.

Schema overview:
  users          - VPN accounts with auth credentials, subscription state, and role
  servers        - Hysteria server registry (multi-server support)
  traffic_last   - Last-seen cumulative byte counters per user per server
  traffic_5m     - 5-minute aggregated traffic buckets for Grafana / analytics
  refresh_tokens - Active JWT refresh tokens (enables server-side revocation)
  maintenance_state - Small key/value state for recurring maintenance tasks

Referential integrity:
  traffic_last.username    -> users.username     ON DELETE CASCADE
  traffic_last.server_id   -> servers.id         ON DELETE CASCADE
  traffic_5m.username      -> users.username     ON DELETE CASCADE
  traffic_5m.server_id     -> servers.id         ON DELETE CASCADE
  refresh_tokens.username  -> users.username     ON DELETE CASCADE

  Deleting a user or a server automatically removes all dependent traffic
  rows and refresh tokens in the same transaction — no manual cleanup
  DELETEs needed in application code before removing a user/server.

--------------------------------------------------------------------
 Security note: hyPassword stored as plaintext — intentional design
--------------------------------------------------------------------

  The users.hyPassword column stores the Hysteria VPN client password
  in plaintext. This is a DELIBERATE architectural constraint, not an
  oversight.

  Why it cannot be hashed:
    Hysteria authenticates clients via POST /auth, which receives the
    raw password from the VPN client and compares it against the stored
    value. Unlike bcrypt (which has a verify function), the Hysteria
    protocol requires knowing the original plaintext to perform the
    comparison — there is no way to verify against a hash here.

    Additionally, the plaintext is embedded directly into the
    hysteria2:// connection URL that is handed to the client
    (see GET /generate-url). This URL must contain the real password.

  Mitigations in place:
    1. hyPassword is NOT the user's account password. It is a separate
       randomly-generated credential (20 alphanumeric chars, ~119 bits
       of entropy) used only for the VPN tunnel.
    2. The account password (used for API login) IS bcrypt-hashed.
    3. Users can regenerate their hyPassword at any time via
       POST /users/{username}/regenerate-hy, which immediately
       invalidates the old VPN credential.
    4. Access to the database must be strictly limited — see the
       production database user setup instructions below.
"""

import logging
from contextlib import contextmanager
from typing import Generator

import psycopg2
from psycopg2 import pool as psycopg2_pool

from config import DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD
from utils import hash_password

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Connection pool
# ---------------------------------------------------------------------------

# Pool sizing:
#   minconn=2  — keep at least 2 connections warm to avoid cold-connect latency
#               on the first requests after a quiet period.
#   maxconn=20 — cap well below PostgreSQL's default max_connections=100 so
#               other services (traffic collector, monitoring) always have
#               headroom. Raise if profiling shows pool exhaustion under load.
_pool: psycopg2_pool.ThreadedConnectionPool | None = None


def init_pool() -> None:
    """
    Create the connection pool. Must be called once before get_db() is used.
    Called from init_db() which runs at application startup.
    """
    logger.info("Initializing PostgreSQL connection pool")
    global _pool
    if _pool is not None:
        return
    _pool = psycopg2_pool.ThreadedConnectionPool(
        minconn=2,
        maxconn=20,
        dsn=DATABASE_URL,
        options="-c timezone=UTC",  # all pool connections use UTC
    )
    logger.info("PostgreSQL connection pool created (min=2, max=20)")


# ---------------------------------------------------------------------------
# Connection factory
# ---------------------------------------------------------------------------

@contextmanager
def get_db() -> Generator[psycopg2.extensions.connection, None, None]:
    """
    Borrow a PostgreSQL connection from the pool and yield it.
    The connection is returned to the pool on exit — not closed.

    Each caller opens its own RealDictCursor so that multiple independent
    result sets can coexist within the same request without interfering.
    """
    if _pool is None:
        raise RuntimeError("Connection pool is not initialised — call init_pool() first")

    conn = _pool.getconn()
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


# ---------------------------------------------------------------------------
# Schema initialization
# ---------------------------------------------------------------------------

def init_db() -> None:
    """
    Create the connection pool, create all tables (with foreign keys and
    cascading deletes) if they don't exist, and seed the initial admin.
    Called once at application startup.
    """
    logger.info("Initializing PostgreSQL database")

    init_pool()

    with get_db() as conn:
        # Parent tables first — traffic_* and refresh_tokens reference these.
        _create_users_table(conn)
        _create_servers_table(conn)
        _migrate_user_created_at(conn)
        _migrate_user_note(conn)
        # Child tables — declare FKs inline since parents already exist.
        _create_traffic_tables(conn)
        _create_refresh_tokens_table(conn)
        _create_maintenance_state_table(conn)
        _seed_admin(conn)
        conn.commit()

    logger.info("Database initialization complete")


# ---------------------------------------------------------------------------
# Table creation helpers
# ---------------------------------------------------------------------------

def _create_users_table(conn: psycopg2.extensions.connection) -> None:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                username      TEXT PRIMARY KEY,
                password      TEXT NOT NULL,
                "hyPassword"  TEXT NOT NULL,
                allowed       BOOLEAN NOT NULL DEFAULT FALSE,
                "usedTraffic" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
                active        BOOLEAN NOT NULL DEFAULT FALSE,
                expires_at    TIMESTAMPTZ DEFAULT NULL,
                url_token     TEXT DEFAULT NULL,
                role          TEXT NOT NULL DEFAULT 'user',
                statuses      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
                created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                note          TEXT NOT NULL DEFAULT ''
            )
        """)


def _create_servers_table(conn: psycopg2.extensions.connection) -> None:
    # protocol field is a foundation for the future
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS servers (
                id           TEXT PRIMARY KEY,
                country      TEXT NOT NULL,
                city         TEXT NOT NULL,
                ip           TEXT NOT NULL,
                domain       TEXT DEFAULT NULL,
                port         INTEGER NOT NULL DEFAULT 443,
                label        TEXT    NOT NULL DEFAULT 'VPN',
                protocol     TEXT    NOT NULL DEFAULT 'hysteria2',
                hysteria_url TEXT    DEFAULT NULL,
                active       BOOLEAN NOT NULL DEFAULT TRUE,
                created_at   TIMESTAMPTZ DEFAULT NOW(),
                updated_at   TIMESTAMPTZ DEFAULT NOW()
            )
        """)


def _create_traffic_tables(conn: psycopg2.extensions.connection) -> None:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS traffic_last (
                username     TEXT NOT NULL
                    REFERENCES users(username) ON DELETE CASCADE,
                server_id    TEXT NOT NULL
                    REFERENCES servers(id) ON DELETE CASCADE,
                last_total   DOUBLE PRECISION NOT NULL DEFAULT 0,
                last_updated TIMESTAMPTZ DEFAULT NOW(),
                PRIMARY KEY (username, server_id)
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS traffic_5m (
                id          SERIAL PRIMARY KEY,
                username    TEXT NOT NULL
                    REFERENCES users(username) ON DELETE CASCADE,
                server_id   TEXT NOT NULL
                    REFERENCES servers(id) ON DELETE CASCADE,
                bucket_time TIMESTAMPTZ NOT NULL,
                delta_gb    DOUBLE PRECISION NOT NULL,
                UNIQUE(username, server_id, bucket_time)
            )
        """)

        cur.execute("CREATE INDEX IF NOT EXISTS idx_5m_time   ON traffic_5m(bucket_time)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_5m_user   ON traffic_5m(username, bucket_time)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_5m_server ON traffic_5m(server_id, bucket_time)")


def _create_refresh_tokens_table(conn: psycopg2.extensions.connection) -> None:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                token      TEXT PRIMARY KEY,
                username   TEXT NOT NULL
                    REFERENCES users(username) ON DELETE CASCADE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)

        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_refresh_tokens_username ON refresh_tokens(username)"
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires  ON refresh_tokens(expires_at)"
        )


def _create_maintenance_state_table(conn: psycopg2.extensions.connection) -> None:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS maintenance_state (
                key        TEXT PRIMARY KEY,
                value      TEXT NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)


# ---------------------------------------------------------------------------
# Lightweight startup migrations
# ---------------------------------------------------------------------------

def _migrate_user_created_at(conn: psycopg2.extensions.connection) -> None:
    """
    Add users.created_at for databases created before the column existed.

    Existing accounts are backfilled to the agreed launch date at 10:00 Moscow
    time (07:00 UTC). New accounts use NOW() from PostgreSQL, stored as
    TIMESTAMPTZ in UTC.
    """
    with conn.cursor() as cur:
        cur.execute("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ
        """)
        cur.execute("""
            UPDATE users
            SET created_at = TIMESTAMPTZ '2026-09-01 07:00:00+00'
            WHERE created_at IS NULL
        """)
        cur.execute("""
            ALTER TABLE users
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN created_at SET NOT NULL
        """)


def _migrate_user_note(conn: psycopg2.extensions.connection) -> None:
    """Add a short admin-only note to existing user tables."""
    with conn.cursor() as cur:
        cur.execute("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS note TEXT NOT NULL DEFAULT ''
        """)
        cur.execute("""
            ALTER TABLE users
            DROP CONSTRAINT IF EXISTS users_note_length_check
        """)
        cur.execute("""
            ALTER TABLE users
            ADD CONSTRAINT users_note_length_check CHECK (char_length(note) <= 64)
        """)


# ---------------------------------------------------------------------------
# Admin seed
# ---------------------------------------------------------------------------

def _seed_admin(conn: psycopg2.extensions.connection) -> None:
    """
    Create the initial admin from env variables if no admin exists yet.
    Safe to call on every startup.
    """

    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1")
        if cur.fetchone():
            return

        cur.execute(
            """
            INSERT INTO users (username, password, "hyPassword", allowed, active, role)
            VALUES (%s, %s, '', TRUE, TRUE, 'admin')
            ON CONFLICT (username) DO NOTHING
            """,
            (ADMIN_USERNAME, hash_password(ADMIN_PASSWORD)),
        )
    logger.info("Seeded initial admin account: %r", ADMIN_USERNAME)
