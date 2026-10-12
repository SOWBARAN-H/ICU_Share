from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.booking import Booking
from app.models.user import User
from app.models.hospital import Hospital
from app.schemas.booking import BookingCreate, BookingResponse, BookingAcceptRequest, BookingRejectRequest
from app.services.booking_service import (
    create_new_booking, 
    accept_hospital_booking, 
    reject_hospital_booking, 
    format_booking_response
)
from app.dependencies import get_current_hospital, get_current_user, get_current_actor

router = APIRouter(tags=["Bookings"])

@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    actor: Optional[dict] = Depends(get_current_actor),
    db: Session = Depends(get_db)
):
    user_id = actor["entity"].id if actor and actor["type"] == "USER" else None
    return create_new_booking(db, data, user_id=user_id)

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking {booking_id} not found."
        )
    return format_booking_response(booking)

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_network_bookings(
    hospital_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if hospital_id:
        query = query.filter(Booking.hospital_id == hospital_id)
    if status and status.upper() != "ALL":
        query = query.filter(Booking.status == status.upper())
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [format_booking_response(b) for b in bookings]

@router.post("/bookings/{booking_id}/accept", response_model=BookingResponse)
def accept_booking(
    booking_id: str,
    accept_data: Optional[BookingAcceptRequest] = None,
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking request {booking_id} not found."
        )
    if booking.hospital_id != hospital.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot accept a booking designated for another hospital."
        )
    return accept_hospital_booking(db, booking_id, hospital.id, accept_data)

@router.post("/bookings/{booking_id}/reject", response_model=BookingResponse)
def reject_booking(
    booking_id: str,
    reject_data: Optional[BookingRejectRequest] = None,
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking request {booking_id} not found."
        )
    if booking.hospital_id != hospital.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot reject a booking designated for another hospital."
        )
    return reject_hospital_booking(db, booking_id, hospital.id, reject_data)

@router.get("/user/bookings", response_model=List[BookingResponse])
def get_user_bookings(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Booking).filter((Booking.user_id == user.id) | (Booking.user_id == None))
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [format_booking_response(b) for b in bookings]

from app.services.websocket_manager import ws_manager

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    db.delete(booking)
    db.commit()
    ws_manager.broadcast_sync("BOOKING_CANCELLED", {"booking_id": booking_id})
    return None

