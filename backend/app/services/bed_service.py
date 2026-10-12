from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.bed import IcuBed
from app.models.hospital import Hospital
from app.schemas.bed import BedResponse, BedStatusUpdate, BedCreate
from app.services.websocket_manager import ws_manager

def format_bed_response(bed: IcuBed) -> BedResponse:
    facilities_list = [f.strip() for f in (bed.facilities or "").split(",") if f.strip()]
    if not facilities_list:
        facilities_list = ["Ventilator"]
    return BedResponse(
        id=bed.id,
        hospital_id=bed.hospital_id,
        bed_number=bed.bed_number,
        unitNumber=bed.bed_number,
        ward=bed.ward,
        bed_type=bed.bed_type,
        status=bed.status,
        patient_name=bed.patient_name,
        patient_label=bed.patient_label or (f"Admitted Patient ({bed.patient_name})" if bed.patient_name else None),
        expected_release_at=bed.expected_release_at,
        freeETA=bed.expected_release_at,
        note=bed.note or ("Available now (Ready for Intake)" if bed.status == "AVAILABLE" else None),
        reserved_for_booking_id=bed.reserved_for_booking_id,
        facilities=bed.facilities,
        facilitiesList=facilities_list,
        created_at=bed.created_at,
        updated_at=bed.updated_at
    )

def get_beds_for_hospital(db: Session, hospital_id: str) -> List[BedResponse]:
    beds = db.query(IcuBed).filter(IcuBed.hospital_id == hospital_id).order_by(IcuBed.id.asc()).all()
    return [format_bed_response(b) for b in beds]

def update_bed_status_by_hospital(
    db: Session,
    hospital_id: str,
    bed_id: str,
    update_data: BedStatusUpdate
) -> BedResponse:
    bed = db.query(IcuBed).filter(IcuBed.id == bed_id).first()
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ICU Bed with code {bed_id} not found."
        )
    # Ownership verification
    if bed.hospital_id != hospital_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot modify bed units belonging to another medical institution."
        )

    valid_statuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"]
    new_status = update_data.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed: {valid_statuses}"
        )

    bed.status = new_status
    if new_status == "OCCUPIED":
        bed.patient_name = update_data.patient_name or "Admitted Patient"
        bed.patient_label = f"Admitted Patient ({bed.patient_name})"
        bed.expected_release_at = update_data.expected_release_at or "Tomorrow, 4:00 PM"
        bed.note = None
    elif new_status == "AVAILABLE":
        bed.patient_name = None
        bed.patient_label = None
        bed.expected_release_at = None
        bed.note = "Available now (Ready for Intake)"
        bed.reserved_for_booking_id = None
    elif new_status == "MAINTENANCE":
        bed.note = "Sterilization and HEPA filtration cycle in progress"
    elif new_status == "RESERVED":
        bed.note = "Reserved for incoming emergency triage"

    db.commit()

    db.refresh(bed)
    resp = format_bed_response(bed)
    ws_manager.broadcast_sync("BED_STATUS_CHANGED", {
        "hospital_id": hospital_id,
        "bed_id": bed.id,
        "status": new_status,
        "bed": resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    })
    return resp

def register_new_bed(db: Session, hospital_id: str, bed_data: BedCreate) -> BedResponse:
    existing = db.query(IcuBed).filter(IcuBed.id == bed_data.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bed code {bed_data.id} is already registered."
        )
    new_bed = IcuBed(
        id=bed_data.id,
        hospital_id=hospital_id,
        bed_number=bed_data.bed_number or bed_data.id,
        ward=bed_data.ward,
        bed_type=bed_data.bed_type,
        status="AVAILABLE",
        note="Available now (Ready for Intake)",
        facilities=bed_data.facilities or "Ventilator"
    )
    db.add(new_bed)
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if hosp:
        hosp.total_beds = (hosp.total_beds or 0) + 1
    db.commit()
    db.refresh(new_bed)
    resp = format_bed_response(new_bed)
    ws_manager.broadcast_sync("BED_ADDED", {
        "hospital_id": hospital_id,
        "bed_id": new_bed.id,
        "bed": resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    })
    return resp

