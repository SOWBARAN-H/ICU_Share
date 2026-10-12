from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class IcuBed(Base):
    __tablename__ = "icu_beds"

    id = Column(String(50), primary_key=True, index=True) # e.g. "ICU-301"
    hospital_id = Column(String(50), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    bed_number = Column(String(50), nullable=False)
    ward = Column(String(100), default="General ICU Ward")
    bed_type = Column(String(50), default="Trauma ICU")
    status = Column(String(20), default="AVAILABLE") # AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    patient_name = Column(String(100), nullable=True)
    patient_label = Column(String(150), nullable=True)
    expected_release_at = Column(String(100), nullable=True)
    note = Column(String(255), nullable=True)
    reserved_for_booking_id = Column(String(50), nullable=True)
    facilities = Column(String(255), default="Ventilator")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="beds")
