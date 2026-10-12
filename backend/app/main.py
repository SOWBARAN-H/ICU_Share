import os
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import engine, Base
import app.models # Ensure all models are registered
from contextlib import asynccontextmanager
from app.services.websocket_manager import ws_manager

# Create database tables automatically
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        loop = asyncio.get_running_loop()
        ws_manager.set_loop(loop)
    except Exception:
        pass
    yield

app = FastAPI(
    title="ICU Share – Unified Multi-Hospital Real-Time Bed Coordination Platform",
    description="""
    ICU Share is a full-stack real-time ICU resource coordination and booking platform.
    Frontend, Backend REST APIs, SQLite Database, and Real-Time WebSockets are unified into a single service.
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# CORS configuration - allow all origins for flexible local development and network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with standard /api prefix
from app.routers import (
    auth_router,
    hospitals_router,
    beds_router,
    bookings_router,
    notifications_router,
    facilities_router,
    realtime_router,
    system_router
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(hospitals_router, prefix=settings.API_V1_STR)
app.include_router(beds_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(facilities_router, prefix=settings.API_V1_STR)
app.include_router(realtime_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {
        "status": "healthy",
        "service": "icu-share-unified-matrix",
        "realtime_clients": len(ws_manager.active_connections)
    }

# -------------------------------------------------------------
# Unified Full-Stack Static Assets & SPA Client-Side Routing
# -------------------------------------------------------------
WORKSPACE_DIR = Path(__file__).resolve().parent.parent.parent
DIST_DIR = WORKSPACE_DIR / "dist"

if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_spa_app(full_path: str):
        # Do not intercept API, WebSocket or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")

        # Static file in dist root (e.g. vite.svg, favicon.ico)
        target_file = DIST_DIR / full_path
        if full_path and target_file.is_file():
            return FileResponse(target_file)

        # Single Page Application fallback: return index.html for all client routes
        index_file = DIST_DIR / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)

        raise HTTPException(status_code=404, detail="Static index file not found")
else:
    @app.get("/")
    def fallback_root():
        return {
            "status": "online",
            "service": "ICU Share Regional Critical Care Matrix Backend",
            "docs": "/docs",
            "api_v1": settings.API_V1_STR,
            "note": "Frontend dist directory not found. Run 'npm run build' to merge frontend into website."
        }
