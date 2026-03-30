"""
logging_config.py - Centralized logging configuration.

Two-handler strategy:
  console  — always active; writes to stderr (picked up by Docker / systemd).
             Coloured output when the stream is a real TTY or DOCKER_ENV is set.
             Colors are stripped automatically when piping to a file or CI system
             that does not support ANSI (detected via stream.isatty()).
  file     — active only outside Docker (DOCKER_ENV != "true").
             Plain text, rotating: 10 MB per file, 7 backups.
             Format: verbose with module, function, and line number.

Color scheme (ANSI, console only):
  DEBUG    grey
  INFO     bright white (bold)
  WARNING  yellow
  ERROR    red
  CRITICAL bright red (bold)

Noise suppression:
  Third-party libraries (uvicorn internals, asyncio, urllib3, psycopg2)
  are capped at WARNING so they don't drown out application logs.
  Uvicorn access logs are kept at INFO — one line per HTTP request is useful.
"""

import logging
import logging.handlers
import os
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# ANSI colour codes
# ---------------------------------------------------------------------------

_RESET  = "\033[0m"
# _BOLD   = "\033[1m"

_LEVEL_COLOURS: dict[int, str] = {
    logging.DEBUG:    "\033[2;37m",    # dim grey
    logging.INFO:     "\033[1;97m",    # bold bright white
    logging.WARNING:  "\033[1;33m",    # bold yellow
    logging.ERROR:    "\033[1;31m",    # bold red
    logging.CRITICAL: "\033[1;41m",    # bold white on red background
}


# ---------------------------------------------------------------------------
# Custom formatter
# ---------------------------------------------------------------------------

class _ColourFormatter(logging.Formatter):
    """
    Formatter that wraps the levelname in ANSI colour codes.
    Falls back to plain text when the output stream is not a TTY
    (e.g. when stdout/stderr is piped to a file or a CI log collector).
    """

    def __init__(self, fmt: str, datefmt: str, use_colour: bool) -> None:
        super().__init__(fmt, datefmt=datefmt)
        self._use_colour = use_colour

    def format(self, record: logging.LogRecord) -> str:
        if not self._use_colour:
            return super().format(record)

        colour = _LEVEL_COLOURS.get(record.levelno, "")
        original_levelname = record.levelname
        record.levelname = f"{colour}{record.levelname:<7}{_RESET}"
        result = super().format(record)
        record.levelname = original_levelname   # restore for other handlers
        return result


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def setup_logging(log_level: str = "DEBUG") -> None:
    """
    Configure the root logger and all handlers.

    Args:
        log_level: Root log level as a string (e.g. "DEBUG", "INFO").
                   Typically passed from config.LOG_LEVEL.
    """
    # Read DOCKER_ENV directly via os.getenv instead of importing from config.
    # config.py creates a module-level logger at import time, so importing it
    # here would initialise that logger before setup_logging() has run —
    # meaning its first messages would go through Python's default handler
    # (plain stderr, no formatting, no level filtering).
    # Reading the env var directly keeps logging_config free of that dependency.
    in_docker = os.getenv("DOCKER_ENV", "").lower() in ("true", "1", "yes")

    # Colour is enabled when stderr is a real TTY, or when running inside
    # Docker (output goes to the Docker log driver which preserves ANSI).
    use_colour = in_docker or (hasattr(sys.stderr, "isatty") and sys.stderr.isatty())

    _FMT_CONSOLE = "%(asctime)s | %(levelname)-8s | %(name)-30s | %(message)s"
    _FMT_VERBOSE = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s"
    _DATEFMT     = "%Y-%m-%d %H:%M:%S"

    # Build handlers programmatically so we can pass the formatter instance
    # directly (dictConfig only supports formatter *classes*, not instances).
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(_ColourFormatter(_FMT_CONSOLE, _DATEFMT, use_colour))

    handlers: list[logging.Handler] = [console_handler]

    if not in_docker:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        file_handler = logging.handlers.RotatingFileHandler(
            filename=str(log_dir / "app.log"),
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=7,
            encoding="utf-8",
        )
        file_handler.setLevel(logging.DEBUG)
        # Plain formatter for files — no ANSI codes in log archives
        file_handler.setFormatter(logging.Formatter(_FMT_VERBOSE, datefmt=_DATEFMT))
        handlers.append(file_handler)

    # Apply to root logger
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    root.handlers.clear()
    for h in handlers:
        root.addHandler(h)

    # ----------------------------------------------------------------
    # Per-logger levels
    # ----------------------------------------------------------------
    
    app_namespaces = [
        "main", "database", "auth_jwt", "traffic_collector", "config",
        "routers.auth", "routers.users", "routers.servers",
        "routers.hysteria", "routers.traffic", "routers.ws",
    ]
    for name in app_namespaces:
        logging.getLogger(name).setLevel(log_level)

    # Suppress noisy third-party libraries
    for name in ("uvicorn", "uvicorn.error", "fastapi", "asyncio",
                 "urllib3", "requests", "psycopg2", "multipart"):
        logging.getLogger(name).setLevel(logging.WARNING)

    # Keep one access-log line per HTTP request
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)