from app.routers.auth import router as auth_router
from app.routers.hospitals import router as hospitals_router
from app.routers.beds import router as beds_router
from app.routers.bookings import router as bookings_router
from app.routers.notifications import router as notifications_router
from app.routers.facilities import router as facilities_router
from app.routers.realtime import router as realtime_router
from app.routers.system import router as system_router

__all__ = [
    "auth_router",
    "hospitals_router",
    "beds_router",
    "bookings_router",
    "notifications_router",
    "facilities_router",
    "realtime_router",
    "system_router"
]

