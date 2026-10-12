#!/usr/bin/env python3
"""
ICU Share – Unified Platform Runner
Merges Frontend, Backend APIs, SQLite Database, and Real-Time WebSockets into ONE unified server.
"""

import os
import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
DIST_DIR = ROOT_DIR / "dist"
DB_FILE = BACKEND_DIR / "icushare.db"

def banner():
    print("=" * 70)
    print("  ICU SHARE – UNIFIED CRITICAL CARE PLATFORM")
    print("  Frontend + Backend REST APIs + SQLite DB + Real-Time WebSockets")
    print("=" * 70)

def ensure_database():
    """Verify that the SQLite database exists and is populated."""
    sys.path.insert(0, str(BACKEND_DIR))
    from app.database import SessionLocal
    from app.models.hospital import Hospital

    db = SessionLocal()
    try:
        count = db.query(Hospital).count()
        if count == 0:
            print("[Database] Empty database detected. Seeding demo data...")
            from seed import seed_database
            seed_database()
        else:
            print(f"[Database] SQLite database ready ({count} hospitals connected).")
    except Exception as e:
        print(f"[Database] Initializing schema and seeding database: {e}")
        from seed import seed_database
        seed_database()
    finally:
        db.close()

def ensure_frontend_build():
    """Verify that the compiled frontend distribution exists."""
    if not DIST_DIR.exists() or not (DIST_DIR / "index.html").exists():
        print("[Frontend] Building production bundle (npm run build)...")
        res = subprocess.run(["npm", "run", "build"], cwd=str(ROOT_DIR), shell=True)
        if res.returncode != 0:
            print("[Frontend Warning] Build failed. Please run 'npm run build' manually.")
        else:
            print("[Frontend] Built successfully.")
    else:
        print("[Frontend] Production distribution found in dist/.")

def start_server():
    """Starts the unified Uvicorn server hosting both API and Frontend."""
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))

    print(f"\n[Platform Live]")
    print(f"  -> Unified Web Portal: http://{host}:{port}/")
    print(f"  -> User Portal:        http://{host}:{port}/user/dashboard")
    print(f"  -> Hospital Portal:    http://{host}:{port}/hospital/dashboard")
    print(f"  -> API Documentation:  http://{host}:{port}/docs")
    print(f"  -> Real-Time WebSocket:ws://{host}:{port}/api/ws")
    print(f"  -> Database Engine:    SQLite ({DB_FILE.name})\n")

    os.chdir(str(BACKEND_DIR))
    uvicorn.run("app.main:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    banner()
    ensure_database()
    ensure_frontend_build()
    start_server()
