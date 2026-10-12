import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hospital import Hospital
from app.models.bed import IcuBed
from app.models.booking import Booking
from app.models.user import User
from app.models.notification import Notification
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    hospitals_count = db.query(Hospital).count()
    beds_count = db.query(IcuBed).count()
    available_beds = db.query(IcuBed).filter(IcuBed.status == "AVAILABLE").count()
    bookings_count = db.query(Booking).count()
    pending_bookings = db.query(Booking).filter(Booking.status == "PENDING").count()
    users_count = db.query(User).count()
    notifications_count = db.query(Notification).count()

    return {
        "status": "healthy",
        "database": "connected",
        "hospitals_count": hospitals_count,
        "beds_total": beds_count,
        "beds_available": available_beds,
        "bookings_total": bookings_count,
        "bookings_pending": pending_bookings,
        "users_count": users_count,
        "notifications_count": notifications_count,
        "realtime_clients": len(ws_manager.active_connections)
    }

@router.post("/reset-db")
def reset_database():
    """Resets the live database to clean baseline and broadcasts to all clients."""
    try:
        # Import seed_database from seed.py
        backend_dir = Path(__file__).resolve().parent.parent.parent
        if str(backend_dir) not in sys.path:
            sys.path.insert(0, str(backend_dir))
        from seed import seed_database
        seed_database()

        # Broadcast event so all browser portals immediately refresh with fresh DB state
        ws_manager.broadcast_sync("DATABASE_RESET", {
            "message": "Database successfully reseeded to pristine baseline."
        })

        return {
            "status": "success",
            "message": "ICU Share database has been reseeded to pristine baseline with real data."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset database: {str(e)}"
        )
