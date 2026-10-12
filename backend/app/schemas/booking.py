from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class BookingCreate(BaseModel):
    hospital_id: str
    patient_name: str
    patient_mobile: Optional[str] = None
    age: Optional[int] = 50
    gender: Optional[str] = "Female"
    severity: str = "Critical" # Critical, High, Moderate, Stable
    beds_required: Optional[int] = 1
    current_location: str
    caller_name: Optional[str] = None
    caller_phone: Optional[str] = None
    transit_eta: Optional[str] = "10 mins"
    clinical_notes: Optional[str] = None
    required_facilities: List[str] = []

class BookingAcceptRequest(BaseModel):
    bed_id: Optional[str] = None

class BookingRejectRequest(BaseModel):
    rejection_reason: Optional[str] = "No suitable ICU bed available due to emergency surge."

class BookingResponse(BaseModel):
    id: str
    user_id: Optional[int] = None
    hospital_id: str
    hospitalId: Optional[str] = None
    hospitalName: str
    patientName: str
    patientMobile: Optional[str] = None
    age: int
    gender: str
    acuity: str
    bedsRequested: int
    currentLocation: str
    locationText: Optional[str] = None
    callerName: Optional[str] = None
    callerPhone: Optional[str] = None
    transitEta: Optional[str] = None
    clinicalNotes: Optional[str] = None
    status: str
    assignedBedId: Optional[str] = None
    rejectionReason: Optional[str] = None
    note: Optional[str] = None
    requiredFacilities: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
