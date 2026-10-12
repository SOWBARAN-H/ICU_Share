import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("icushare.realtime_router")
router = APIRouter(tags=["Realtime"])

@router.websocket("/ws")
async def realtime_websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial connected handshake
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "data": {
                "status": "online",
                "message": "Connected to ICU Share Real-Time Database Event Matrix",
                "active_clients": len(ws_manager.active_connections)
            }
        }))
        while True:
            # Keep alive and receive client messages (e.g. heartbeat ping)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "PONG"}))
            elif data.startswith("{"):
                try:
                    payload = json.loads(data)
                    if payload.get("type") == "PING":
                        await websocket.send_text(json.dumps({"event": "PONG"}))
                except Exception:
                    pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket session terminated: {e}")
        ws_manager.disconnect(websocket)

@router.get("/realtime/status")
def get_realtime_status():
    return {
        "status": "active",
        "active_connections": len(ws_manager.active_connections),
        "protocol": "WebSocket + Live DB Events"
    }
