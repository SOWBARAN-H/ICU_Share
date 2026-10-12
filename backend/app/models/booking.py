from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(50), primary_key=True, index=True) # e.g. "ICU-REQ-1048"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    hospital_id = Column(String(50), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    patient_name = Column(String(100), nullable=False)
    patient_mobile = Column(String(20), nullable=True)
    age = Column(Integer, default=50)
    gender = Column(String(20), default="Unspecified")
    severity = Column(String(20), default="Critical") # Critical, High, Moderate, Stable
    beds_required = Column(Integer, default=1)
    current_location = Column(String(255), nullable=False)
    caller_name = Column(String(100), nullable=True)
    caller_phone = Column(String(30), nullable=True)
    transit_eta = Column(String(50), default="10 mins")
    clinical_notes = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, ACCEPTED, CONFIRMED, REJECTED, CANCELLED
    assigned_bed_id = Column(String(50), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    note = Column(String(255), default="Hospital coordination desk notified. Estimated response < 2 mins.")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    hospital = relationship("Hospital", back_populates="bookings")
    facilities = relationship("BookingFacility", back_populates="booking", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="booking", cascade="all, delete-orphan")

class BookingFacility(Base):
    __tablename__ = "booking_facilities"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    facility_name = Column(String(50), nullable=False)

    booking = relationship("Booking", back_populates="facilities")
