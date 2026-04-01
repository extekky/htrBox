"""
main.py - FastAPI application entry point.

Responsibilities:
  - Configure logging before any other imports
  - Build the FastAPI app with CORS and security headers middleware
  - Register all routers
  - Initialize the database schema and seed the initial admin
  - Start background services (traffic collector, maintenance, rate limiter cleanup)
"""

# Logging must be configured before any other import that creates a logger.
from config import LOG_LEVEL, ALLOWED_ORIGINS, DOCS_ENABLED, COOKIE_SECURE
from logging_config import setup_logging

setup_logging(LOG_LEVEL)

import logging

logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, get_db
from traffic_collector import start_traffic_collector
from maintenance import start_maintenance_worker
from routers import (
    auth, 
    hysteria, 
    servers, 
    traffic, 
    users,
)
from rate_limiter import start_cleanup, rate_limit
from config import (
    RT_HEALTH_REQ, 
    RT_HEALTH_WIN,
)

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Initialize DB and start background workers."""
    init_db()

    start_cleanup()
    logger.info("Rate limiter cleanup started")

    try:
        start_traffic_collector()
        logger.info("Traffic collector started successfully")
    except Exception as e:
        logger.critical("Failed to start traffic collector: %s", e, exc_info=True)
        raise  # without a collector, traffic does not count - we fall

    try:
        start_maintenance_worker()
        logger.info("Maintenance worker started successfully")
    except Exception as e:
        logger.critical("Failed to start maintenance worker: %s", e, exc_info=True)
        raise

    yield


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Hysteria 2 Auth & Management Backend",
    lifespan=lifespan,
    docs_url="/docs" if DOCS_ENABLED else None,
    redoc_url="/redoc" if DOCS_ENABLED else None,
    openapi_url="/openapi.json" if DOCS_ENABLED else None,
)


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next) -> Response:
    """Attach baseline security headers to every response.

    HSTS (Strict-Transport-Security) is only sent when COOKIE_SECURE=true,
    meaning we are running over HTTPS in production. Sending HSTS over plain
    HTTP (dev) is pointless and causes browser warnings - so we skip it.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    if COOKIE_SECURE:
        # Tell browsers to only connect over HTTPS for the next 2 years.
        # includeSubDomains covers any subdomains you may add later.
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains"
        )

    return response


_GLOBAL_MAX_BODY = 1 * 1024 * 1024  # 1 MB - sufficient for any API call


@app.middleware("http")
async def body_size_limit_middleware(request: Request, call_next) -> Response:
    """
    Reject requests with oversized bodies before they reach any handler.
    """
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > _GLOBAL_MAX_BODY:
        return Response(
            content='{"detail": "Request body too large"}',
            status_code=413,
            media_type="application/json",
        )
    return await call_next(request)


# ---------------------------------------------------------------------------
# Health check (no auth - used by Docker, load balancers, uptime monitors)
# ---------------------------------------------------------------------------

@app.get(
        "/health", 
        tags=["system"], 
        dependencies=[rate_limit(
            RT_HEALTH_REQ, 
            RT_HEALTH_WIN,
        )]
)
def health_check():
    """
    Liveness + readiness probe.

    Returns 200 {"status": "ok"} if the app is running and the DB is reachable.
    Returns 503 if the database connection fails.

    No authentication required - this endpoint is intentionally public so
    Docker healthchecks, reverse proxies, and uptime monitors can use it
    without credentials.
    """
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
    except Exception as e:
        logger.error("Health check failed: %s", e)
        raise HTTPException(503, "Database unavailable")
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(hysteria.router)
app.include_router(servers.router)
app.include_router(traffic.router)