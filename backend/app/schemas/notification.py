from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    hospital_id: Optional[str] = None
    booking_id: Optional[str] = None
    title: str
    message: str
    type: str # confirmed, unavailable, critical, incoming, info
    ref: Optional[str] = None
    is_read: bool = False
    timeAgo: Optional[str] = "Just now"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
