from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class HospitalFacility(Base):
    __tablename__ = "hospital_facilities"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(String(50), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    facility_name = Column(String(50), nullable=False) # e.g. "Ventilator", "Cardiac ICU", "ECMO", "Trauma ICU", "PICU", "Isolation"

    hospital = relationship("Hospital", back_populates="facilities")
