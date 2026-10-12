from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hospital import Hospital
from app.schemas.bed import BedResponse, BedStatusUpdate, BedCreate
from app.services.bed_service import get_beds_for_hospital, update_bed_status_by_hospital, register_new_bed
from app.dependencies import get_current_hospital, get_optional_hospital

router = APIRouter(tags=["Beds"])

@router.get("/hospital/beds", response_model=List[BedResponse])
def list_hospital_beds(
    hospital_id: Optional[str] = Query(None, description="Optional hospital ID if browsing publicly"),
    auth_hospital: Optional[Hospital] = Depends(lambda: None), # Or authenticated hospital
    db: Session = Depends(get_db)
):
    target_id = hospital_id
    if not target_id:
        # Fallback to Government General Hospital default demo node if not specified
        target_id = "hosp-3"

    return get_beds_for_hospital(db, target_id)

@router.patch("/hospital/beds/{bed_id}", response_model=BedResponse)
def update_bed(
    bed_id: str,
    update_data: BedStatusUpdate,
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    return update_bed_status_by_hospital(db, hospital.id, bed_id, update_data)

@router.post("/hospital/beds", response_model=BedResponse)
def register_bed(
    bed_data: BedCreate,
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    return register_new_bed(db, hospital.id, bed_data)

