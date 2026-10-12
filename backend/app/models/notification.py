from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    hospital_id = Column(String(50), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=True)
    booking_id = Column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info") # confirmed, unavailable, critical, incoming, info
    ref = Column(String(50), nullable=True) # e.g. "ICU-REQ-1047"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    hospital = relationship("Hospital", back_populates="notifications")
    booking = relationship("Booking", back_populates="notifications")
