import random
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingFacility
from app.models.hospital import Hospital
from app.models.bed import IcuBed
from app.models.notification import Notification
from app.schemas.booking import BookingCreate, BookingResponse, BookingAcceptRequest, BookingRejectRequest
from app.services.websocket_manager import ws_manager

def format_booking_response(booking: Booking) -> BookingResponse:
    facilities_list = [f.facility_name for f in booking.facilities]
    hosp_name = booking.hospital.name if booking.hospital else "Regional Medical Center"
    
    # Calculate human-readable time text
    delta = datetime.utcnow() - booking.created_at
    minutes = int(delta.total_seconds() / 60)
    if minutes < 2:
        time_text = "Just now"
    elif minutes < 60:
        time_text = f"{minutes} mins ago"
    else:
        hours = int(minutes / 60)
        time_text = f"{hours} hr ago" if hours == 1 else f"{hours} hrs ago"

    location_text = f"{booking.current_location} • {time_text}"

    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        hospital_id=booking.hospital_id,
        hospitalId=booking.hospital_id,
        hospitalName=hosp_name,
        patientName=booking.patient_name,
        patientMobile=booking.patient_mobile,
        age=booking.age or 50,
        gender=booking.gender or "Unspecified",
        acuity=booking.severity or "Critical",
        bedsRequested=booking.beds_required or 1,
        currentLocation=booking.current_location,
        locationText=location_text,
        callerName=booking.caller_name,
        callerPhone=booking.caller_phone,
        transitEta=booking.transit_eta or "10 mins",
        clinicalNotes=booking.clinical_notes,
        status=booking.status,
        assignedBedId=booking.assigned_bed_id,
        rejectionReason=booking.rejection_reason,
        note=booking.note or "Hospital coordination desk notified. Estimated response < 2 mins.",
        requiredFacilities=facilities_list,
        created_at=booking.created_at,
        updated_at=booking.updated_at
    )

def create_new_booking(db: Session, data: BookingCreate, user_id: Optional[int] = None) -> BookingResponse:
    hospital = db.query(Hospital).filter(Hospital.id == data.hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {data.hospital_id} not found."
        )

    # Generate realistic unique ID format: ICU-REQ-XXXX
    booking_id = f"ICU-REQ-{random.randint(1000, 9999)}"
    while db.query(Booking).filter(Booking.id == booking_id).first():
        booking_id = f"ICU-REQ-{random.randint(1000, 9999)}"

    new_booking = Booking(
        id=booking_id,
        user_id=user_id,
        hospital_id=hospital.id,
        patient_name=data.patient_name,
        patient_mobile=data.patient_mobile or data.caller_phone,
        age=data.age or 50,
        gender=data.gender or "Female",
        severity=data.severity,
        beds_required=data.beds_required or 1,
        current_location=data.current_location,
        caller_name=data.caller_name or "EMS Dispatcher",
        caller_phone=data.caller_phone or "+91 98401 23456",
        transit_eta=data.transit_eta or "10 mins",
        clinical_notes=data.clinical_notes,
        status="PENDING",
        note="Hospital coordination desk notified. Estimated response < 2 mins."
    )
    db.add(new_booking)

    # Attach required facilities
    facilities = data.required_facilities if data.required_facilities else ["Ventilator"]
    for fac in facilities:
        bf = BookingFacility(booking_id=booking_id, facility_name=fac)
        db.add(bf)

    # Create Hospital notification
    hosp_notif = Notification(
        hospital_id=hospital.id,
        booking_id=booking_id,
        title=f"Inbound Triage Alert ({booking_id})",
        message=f"Incoming critical transfer request for {data.patient_name} ({data.severity} priority).",
        type="incoming",
        ref=booking_id
    )
    db.add(hosp_notif)

    # Create User notification if user account exists
    user_notif = Notification(
        user_id=user_id,
        booking_id=booking_id,
        title=f"Booking Ticket Generated ({booking_id})",
        message=f"Request submitted to {hospital.name} for {data.patient_name}. Waiting for hospital response.",
        type="info",
        ref=booking_id
    )
    db.add(user_notif)

    db.commit()
    db.refresh(new_booking)
    resp = format_booking_response(new_booking)
    ws_manager.broadcast_sync("BOOKING_CREATED", {
        "booking_id": new_booking.id,
        "hospital_id": new_booking.hospital_id,
        "patient_name": new_booking.patient_name,
        "severity": new_booking.severity,
        "status": new_booking.status,
        "booking": resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    })
    return resp

def accept_hospital_booking(
    db: Session,
    booking_id: str,
    hospital_id: str,
    accept_data: Optional[BookingAcceptRequest] = None
) -> BookingResponse:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking request {booking_id} not found."
        )

    # Use booking's designated hospital as primary authority
    effective_hosp_id = booking.hospital_id or hospital_id

    # State validation: Must be PENDING
    if booking.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot accept booking: Current status is already '{booking.status}'."
        )

    # Find available ICU bed
    target_bed = None
    if accept_data and accept_data.bed_id:
        target_bed = db.query(IcuBed).filter(
            IcuBed.id == accept_data.bed_id,
            IcuBed.hospital_id == effective_hosp_id
        ).first()
        if not target_bed or target_bed.status != "AVAILABLE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bed {accept_data.bed_id} is not currently available for intake."
            )
    else:
        target_bed = db.query(IcuBed).filter(
            IcuBed.hospital_id == effective_hosp_id,
            IcuBed.status == "AVAILABLE"
        ).first()

    if not target_bed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available ICU bed unit found in this facility to allocate."
        )

    # Transactional update: Bed AVAILABLE -> RESERVED
    target_bed.status = "RESERVED"
    target_bed.reserved_for_booking_id = booking.id
    target_bed.patient_name = booking.patient_name
    target_bed.patient_label = f"Admitted Patient ({booking.patient_name})"
    target_bed.note = f"Reserved for {booking.patient_name} (Ticket #{booking.id})"

    # Update Booking: PENDING -> CONFIRMED
    booking.status = "CONFIRMED"
    booking.assigned_bed_id = target_bed.id
    booking.note = f"Bed {target_bed.id} locked and reserved. Critical care ambulance transit corridor cleared."

    # Create User Notification
    hosp = db.query(Hospital).filter(Hospital.id == effective_hosp_id).first()
    hosp_name = hosp.name if hosp else "Hospital"
    user_notif = Notification(
        user_id=booking.user_id,
        hospital_id=effective_hosp_id,
        booking_id=booking.id,
        title="ICU Bed Confirmed",
        message=f"{hosp_name} has accepted your ICU booking {booking.id}. Bed assigned: {target_bed.id}.",
        type="confirmed",
        ref=booking.id
    )
    db.add(user_notif)

    # Create Hospital Notification
    hosp_notif = Notification(
        hospital_id=effective_hosp_id,
        booking_id=booking.id,
        title=f"Transfer Accepted ({booking.id})",
        message=f"Intake confirmed for {booking.patient_name}. Bed {target_bed.id} reserved.",
        type="confirmed",
        ref=booking.id
    )
    db.add(hosp_notif)

    db.commit()
    db.refresh(booking)
    resp = format_booking_response(booking)
    ws_manager.broadcast_sync("BOOKING_ACCEPTED", {
        "booking_id": booking.id,
        "hospital_id": booking.hospital_id,
        "assigned_bed_id": target_bed.id,
        "patient_name": booking.patient_name,
        "status": "CONFIRMED",
        "booking": resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    })
    return resp

def reject_hospital_booking(
    db: Session,
    booking_id: str,
    hospital_id: str,
    reject_data: Optional[BookingRejectRequest] = None
) -> BookingResponse:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking request {booking_id} not found."
        )

    effective_hosp_id = booking.hospital_id or hospital_id

    # Idempotent: If already rejected, return current state
    if booking.status == "REJECTED":
        return format_booking_response(booking)

    # If the booking was previously confirmed, free up any reserved bed
    if booking.assigned_bed_id:
        prev_bed = db.query(IcuBed).filter(IcuBed.id == booking.assigned_bed_id).first()
        if prev_bed and prev_bed.status == "RESERVED":
            prev_bed.status = "AVAILABLE"
            prev_bed.patient_name = None
            prev_bed.patient_label = None
            prev_bed.reserved_for_booking_id = None
            prev_bed.note = "Available now (Ready for Intake)"

    reason = reject_data.rejection_reason if reject_data and reject_data.rejection_reason else "No suitable ICU bed available due to emergency surge."
    booking.status = "REJECTED"
    booking.rejection_reason = reason
    booking.note = f"Transfer unavailable: {reason}"
    booking.assigned_bed_id = None

    # Create User Notification
    hosp = db.query(Hospital).filter(Hospital.id == effective_hosp_id).first()
    hosp_name = hosp.name if hosp else "Hospital"
    user_notif = Notification(
        user_id=booking.user_id,
        hospital_id=effective_hosp_id,
        booking_id=booking.id,
        title="ICU Booking Unavailable",
        message=f"{hosp_name} could not accept {booking.id}. Nearby alternatives are available.",
        type="unavailable",
        ref=booking.id
    )
    db.add(user_notif)

    # Create Hospital Notification
    hosp_notif = Notification(
        hospital_id=effective_hosp_id,
        booking_id=booking.id,
        title=f"Transfer Declined ({booking.id})",
        message=f"Request declined for {booking.patient_name}: {reason}",
        type="unavailable",
        ref=booking.id
    )
    db.add(hosp_notif)

    db.commit()
    db.refresh(booking)
    resp = format_booking_response(booking)
    ws_manager.broadcast_sync("BOOKING_REJECTED", {
        "booking_id": booking.id,
        "hospital_id": booking.hospital_id,
        "rejection_reason": reason,
        "status": "REJECTED",
        "booking": resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    })
    return resp
