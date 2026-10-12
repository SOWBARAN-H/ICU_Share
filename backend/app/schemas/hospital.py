from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class HospitalBase(BaseModel):
    name: str
    city: str
    area: str
    address: Optional[str] = None
    type: str = "Government" # Government or Private
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    doctor_in_charge: Optional[str] = None
    node_id: Optional[str] = "H003 (TN-DISPATCH)"
    desk: Optional[str] = "Emergency Triaging Command"
    registration_id: str
    total_beds: int = 50

class HospitalCreate(HospitalBase):
    email: str
    password: str
    facilities: List[str] = []

class HospitalLogin(BaseModel):
    registration_id: Optional[str] = None
    email: Optional[str] = None
    password: str

class HospitalResponse(HospitalBase):
    id: str
    rating: float = 4.5
    latitude: float = 13.0827
    longitude: float = 80.2707
    distanceKm: Optional[float] = 2.5
    travelTime: Optional[str] = "~8 mins"
    totalBeds: Optional[int] = 50
    availableBeds: int = 0
    occupiedBeds: int = 0
    reservedBeds: int = 0
    maintenanceBeds: int = 0
    facilities: List[str] = []
    lastSynced: Optional[str] = "Just now (Database Synced)"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HospitalDashboardResponse(BaseModel):
    total_beds: int
    available_beds: int
    occupied_beds: int
    reserved_beds: int
    maintenance_beds: int
    pending_requests: int
