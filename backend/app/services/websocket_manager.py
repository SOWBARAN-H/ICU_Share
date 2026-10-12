import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import WebSocket

logger = logging.getLogger("icushare.realtime")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    def set_loop(self, loop: asyncio.AbstractEventLoop):
        self._loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return
        payload = json.dumps(message, default=str)
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                disconnected.append(connection)
        for dead in disconnected:
            self.disconnect(dead)

    def broadcast_sync(self, event: str, data: Any = None):
        """Thread-safe and sync-friendly broadcast helper for database services."""
        msg = {
            "event": event,
            "data": data or {},
            "timestamp": None
        }
        try:
            loop = self._loop
            if not loop or loop.is_closed():
                try:
                    loop = asyncio.get_running_loop()
                except RuntimeError:
                    loop = None

            if loop and loop.is_running():
                asyncio.run_coroutine_threadsafe(self.broadcast(msg), loop)
            else:
                try:
                    asyncio.run(self.broadcast(msg))
                except Exception:
                    pass
        except Exception as e:
            logger.debug(f"Broadcast notice: {e}")

ws_manager = ConnectionManager()
