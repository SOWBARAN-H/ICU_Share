from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class BedBase(BaseModel):
    bed_number: str
    ward: str
    bed_type: str = "Trauma ICU"
    status: str = "AVAILABLE"
    patient_name: Optional[str] = None
    patient_label: Optional[str] = None
    expected_release_at: Optional[str] = None
    note: Optional[str] = None
    facilities: Optional[str] = "Ventilator"

class BedCreate(BedBase):
    id: str
    hospital_id: Optional[str] = None

class BedStatusUpdate(BaseModel):
    status: str
    patient_name: Optional[str] = None
    expected_release_at: Optional[str] = None
    note: Optional[str] = None

class BedResponse(BedBase):
    id: str
    hospital_id: str
    unitNumber: Optional[str] = None
    freeETA: Optional[str] = None
    reserved_for_booking_id: Optional[str] = None
    facilitiesList: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
