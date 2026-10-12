from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hospital import Hospital
from app.models.booking import Booking
from app.schemas.hospital import HospitalResponse, HospitalDashboardResponse
from app.schemas.booking import BookingResponse
from app.services.hospital_service import search_hospitals, format_hospital_response, get_hospital_dashboard_metrics
from app.services.booking_service import format_booking_response
from app.services.recommendation_service import get_recommended_alternatives
from app.dependencies import get_current_hospital

router = APIRouter(tags=["Hospitals"])

@router.get("/hospitals", response_model=List[HospitalResponse])
def list_hospitals(
    location: Optional[str] = Query(None, description="City or district (e.g. Chennai, Coimbatore)"),
    type: Optional[str] = Query(None, description="Government or Private"),
    facility: Optional[str] = Query(None, description="Ventilator, ECMO, Cardiac ICU, etc."),
    available_only: bool = Query(False, description="Filter hospitals with free ICU beds"),
    db: Session = Depends(get_db)
):
    return search_hospitals(
        db,
        location=location,
        hospital_type=type,
        facility=facility,
        available_only=available_only
    )

@router.get("/hospitals/recommendations", response_model=List[HospitalResponse])
def get_recommendations(
    excluding_hospital_id: str = Query(..., description="ID of hospital that rejected or has no capacity"),
    facility: Optional[str] = Query(None, description="Required clinical capability"),
    preferred_type: Optional[str] = Query(None, description="Government or Private preference"),
    db: Session = Depends(get_db)
):
    facilities_list = [facility] if facility else ["Ventilator"]
    return get_recommended_alternatives(
        db,
        excluding_hospital_id=excluding_hospital_id,
        required_facilities=facilities_list,
        preferred_type=preferred_type
    )

@router.get("/hospitals/{hospital_id}", response_model=HospitalResponse)
def get_hospital_by_id(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_id} not found."
        )
    return format_hospital_response(db, hospital)

# Hospital Portal Dedicated Routes
@router.get("/hospital/dashboard", response_model=HospitalDashboardResponse)
def get_dashboard_metrics(
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    pending_count = db.query(Booking).filter(
        Booking.hospital_id == hospital.id,
        Booking.status == "PENDING"
    ).count()
    return get_hospital_dashboard_metrics(db, hospital.id, pending_count)

@router.get("/hospital/bookings", response_model=List[BookingResponse])
def get_hospital_bookings(
    hospital_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    # Tenant isolation: strictly enforce authenticated hospital's ID
    target_id = hospital.id
    query = db.query(Booking).filter(Booking.hospital_id == target_id)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Booking.status == status_filter.upper())
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [format_booking_response(b) for b in bookings]
