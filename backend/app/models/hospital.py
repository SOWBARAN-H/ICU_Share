from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(50), primary_key=True, index=True) # e.g. "hosp-1", "hosp-3"
    name = Column(String(150), nullable=False, index=True)
    city = Column(String(50), nullable=False, index=True)
    area = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    type = Column(String(20), nullable=False, default="Government") # "Government" or "Private"
    rating = Column(Float, default=4.5)
    latitude = Column(Float, default=13.0827)
    longitude = Column(Float, default=80.2707)
    phone = Column(String(30), nullable=True)
    emergency_contact = Column(String(30), nullable=True)
    doctor_in_charge = Column(String(100), nullable=True)
    node_id = Column(String(50), nullable=True, default="H003 (TN-DISPATCH)")
    desk = Column(String(100), nullable=True, default="Emergency Triaging Command")
    registration_id = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    total_beds = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)

    facilities = relationship("HospitalFacility", back_populates="hospital", cascade="all, delete-orphan")
    beds = relationship("IcuBed", back_populates="hospital", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hospital", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="hospital", cascade="all, delete-orphan")
