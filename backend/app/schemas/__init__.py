from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.hospital import HospitalCreate, HospitalLogin, HospitalResponse, HospitalDashboardResponse
from app.schemas.bed import BedCreate, BedStatusUpdate, BedResponse
from app.schemas.booking import BookingCreate, BookingResponse, BookingAcceptRequest, BookingRejectRequest
from app.schemas.notification import NotificationResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "HospitalCreate",
    "HospitalLogin",
    "HospitalResponse",
    "HospitalDashboardResponse",
    "BedCreate",
    "BedStatusUpdate",
    "BedResponse",
    "BookingCreate",
    "BookingResponse",
    "BookingAcceptRequest",
    "BookingRejectRequest",
    "NotificationResponse"
]
