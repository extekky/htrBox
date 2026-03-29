"""
Ws router - WebSocket endpoint for push notifications to the frontend.

IMPORTANT: The WebSocket is used ONLY as a notification channel (event bus).
The client receives an event and then makes a regular HTTP request via TANSTACK.
This simplifies the logic and makes the system resilient to WebSocket failures.

Connection:
    WS /ws?token=<access_token>

Events (server -> client):
    {"type": "ping"}                             - heartbeat
    {"type": "user_updated", "username": "x"}    - specific user has been updated
    {"type": "users_changed"}                    - user list has changed
    {"type": "online_changed"}                   - online status has changed
    {"type": "traffic_updated", "username": "x"} - traffic updated (from collector)
    {"type": "servers_changed"}                  - server list has changed

Usage from other routers:
    from routers.ws import notify
    await notify({"type": "users_changed"})
    await notify({"type": "user_updated", "username": "alice"}, target_username="alice")

Usage from traffic_collector (synchronous context):
    from routers.ws import notify_sync
    notify_sync({"type": "traffic_updated", "username": "alice"})
"""

import asyncio
import json
import logging

from fastapi import (
    APIRouter, 
    Query, 
    WebSocket, 
    WebSocketDisconnect,
)

from auth_jwt import decode_access_token

router = APIRouter()
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Connection Manager
# ---------------------------------------------------------------------------

class ConnectionManager:
    """
    Stores all active WebSocket connections keyed by username.
    Thread-safe via asyncio.Lock.
    """

    def __init__(self):
        # username -> list[WebSocket] (one user can have multiple tabs)
        self._connections: dict[str, list[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket, username: str) -> None:
        await ws.accept()
        async with self._lock:
            self._connections.setdefault(username, []).append(ws)
            logger.debug("WS connected: %r (total users: %d)", username, len(self._connections))

    async def disconnect(self, ws: WebSocket, username: str) -> None:
        async with self._lock:
            conns = self._connections.get(username, [])
            if ws in conns:
                conns.remove(ws)
            if not conns:
                self._connections.pop(username, None)
            logger.debug("WS disconnected: %r", username)

    async def broadcast(self, message: dict) -> None:
        """Send a message to all connected clients."""
        data = json.dumps(message)
        dead: list[tuple[str, WebSocket]] = []

        async with self._lock:
            snapshot = {u: list(ws_list) for u, ws_list in self._connections.items()}

        for username, ws_list in snapshot.items():
            for ws in ws_list:
                try:
                    await ws.send_text(data)
                except Exception:
                    dead.append((username, ws))

        # Remove dead connections
        for username, ws in dead:
            await self.disconnect(ws, username)

    async def send_to_user(self, username: str, message: dict) -> None:
        """Send a message to a specific user (all their tabs)."""
        data = json.dumps(message)
        async with self._lock:
            ws_list = list(self._connections.get(username, []))
        dead = []
        for ws in ws_list:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws, username)

    async def broadcast_except(self, excluded_username: str, message: dict) -> None:
        """Send a message to all connected clients EXCEPT the given user."""
        data = json.dumps(message)
        dead: list[tuple[str, WebSocket]] = []

        async with self._lock:
            snapshot = {
                u: list(ws_list)
                for u, ws_list in self._connections.items()
                if u != excluded_username
            }

        for username, ws_list in snapshot.items():
            for ws in ws_list:
                try:
                    await ws.send_text(data)
                except Exception:
                    dead.append((username, ws))

        for username, ws in dead:
            await self.disconnect(ws, username)

    @property
    def active_count(self) -> int:
        return sum(len(v) for v in self._connections.values())


# manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Public notify API (used from other modules)
# ---------------------------------------------------------------------------

# async def notify(
#     message: dict,
#     target_username: str | None = None,
# ) -> None:
#     """
#     Send a WebSocket notification.

#     target_username=None -> broadcast to all connected clients.
#     target_username set  -> send to that user's connections AND broadcast to
#                            everyone else (so admin panels also receive the event).

#     NOTE: this function is not yet called from any router or background worker.
#     The WebSocket infrastructure is in place but notifications are not wired up.
#     Until that happens, connected clients only receive periodic pings.
#     """
#     if target_username:
#         await manager.send_to_user(target_username, message)
#         await manager.broadcast_except(target_username, message)
#     else:
#         await manager.broadcast(message)

# def notify_sync(message: dict, loop: asyncio.AbstractEventLoop | None = None) -> None:
#     """
#     Synchronous wrapper for notify() — used from traffic_collector
#     which runs in a separate thread outside the asyncio event loop.
#     """
#     try:
#         app_loop = loop or asyncio.get_running_loop()
#         asyncio.run_coroutine_threadsafe(notify(message), app_loop)
#     except RuntimeError:
#         # No running event loop in this thread — nothing to do
#         logger.debug("notify_sync: no running event loop found")
#     except Exception as e:
#         logger.debug("notify_sync failed: %s", e)


# # ---------------------------------------------------------------------------
# # WebSocket endpoint
# # ---------------------------------------------------------------------------

# @router.websocket("/ws")
# async def websocket_endpoint(
#     ws: WebSocket,
#     token: str | None = Query(None),
# ):
#     """
#     WebSocket connection for push notifications.
#     Auth via ?token=<access_token>. Invalid token closes the connection.
#     Anonymous connections are not permitted.
#     """
#     # Rejection must always be accept() -> close() so the browser receives a
#     # proper WebSocket close frame with a meaningful code and reason string.
#     # Calling close() before accept() produces a bare TCP reset — the client
#     # sees code 1006 (Abnormal Closure) with an empty reason, making it
#     # impossible to distinguish an auth failure from a network drop.
#     if not token:
#         await ws.accept()
#         await ws.close(code=4001, reason="Authentication required")
#         return

#     try:
#         payload  = decode_access_token(token)
#         username = payload.get("sub")
#         if not username:
#             raise ValueError("No subject in token")
#     except Exception:
#         await ws.accept()
#         await ws.close(code=4001, reason="Invalid token")
#         return

#     await manager.connect(ws, username)

#     try:
#         # Send initial ping
#         await ws.send_text(json.dumps({"type": "ping"}))

#         while True:
#             try:
#                 data = await asyncio.wait_for(ws.receive_text(), timeout=60.0)
#                 msg  = json.loads(data)
#                 if msg.get("type") in ("ping", "pong"):
#                     pass  # keep-alive
#             except asyncio.TimeoutError:
#                 try:
#                     await ws.send_text(json.dumps({"type": "ping"}))
#                 except Exception:
#                     break
#             except WebSocketDisconnect:
#                 break  # client disconnected — exit the loop cleanly
#             except Exception as e:
#                 logger.debug("WS error for %r: %s", username, e)

#     finally:
#         await manager.disconnect(ws, username)