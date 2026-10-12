from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.hospital import Hospital
from app.models.bed import IcuBed
from app.models.facility import HospitalFacility
from app.schemas.hospital import HospitalResponse, HospitalDashboardResponse

def get_hospital_bed_counts(db: Session, hospital_id: str):
    beds = db.query(IcuBed).filter(IcuBed.hospital_id == hospital_id).all()
    available = sum(1 for b in beds if b.status == "AVAILABLE")
    occupied = sum(1 for b in beds if b.status == "OCCUPIED")
    reserved = sum(1 for b in beds if b.status == "RESERVED")
    maintenance = sum(1 for b in beds if b.status == "MAINTENANCE")
    total = len(beds)
    return {
        "available": available,
        "occupied": occupied,
        "reserved": reserved,
        "maintenance": maintenance,
        "total": total
    }

def format_hospital_response(db: Session, hospital: Hospital, distance_km: float = 2.5) -> HospitalResponse:
    counts = get_hospital_bed_counts(db, hospital.id)
    facility_names = [f.facility_name for f in hospital.facilities]

    # Estimated travel time calculation based on distance
    mins = max(4, int(distance_km * 3.5))
    travel_time = f"~{mins} mins"

    return HospitalResponse(
        id=hospital.id,
        name=hospital.name,
        city=hospital.city,
        area=hospital.area,
        address=hospital.address,
        type=hospital.type,
        rating=hospital.rating,
        latitude=hospital.latitude,
        longitude=hospital.longitude,
        phone=hospital.phone,
        emergency_contact=hospital.emergency_contact,
        doctor_in_charge=hospital.doctor_in_charge,
        node_id=hospital.node_id or "H003 (TN-DISPATCH)",
        desk=hospital.desk or "Emergency Triaging Command",
        registration_id=hospital.registration_id,
        total_beds=counts["total"],
        totalBeds=counts["total"],
        availableBeds=counts["available"],
        occupiedBeds=counts["occupied"],
        reservedBeds=counts["reserved"],
        maintenanceBeds=counts["maintenance"],
        distanceKm=distance_km,
        travelTime=travel_time,
        facilities=facility_names,
        lastSynced="Just now (Database Synced)",
        created_at=hospital.created_at
    )

def search_hospitals(
    db: Session,
    location: Optional[str] = None,
    hospital_type: Optional[str] = None,
    facility: Optional[str] = None,
    available_only: bool = False
) -> List[HospitalResponse]:
    query = db.query(Hospital)

    if hospital_type and hospital_type.lower() != "all":
        query = query.filter(Hospital.type.ilike(f"%{hospital_type}%"))

    hospitals = query.all()
    results = []

    # Distances map to preserve realistic demo travel metrics from frontend
    known_distances = {
        "hosp-1": 1.8,
        "hosp-2": 4.2,
        "hosp-3": 2.8,
        "hosp-4": 3.2,
        "hosp-5": 2.6,
        "hosp-6": 1.9,
    }

    for h in hospitals:
        # Location filter
        if location and location.strip():
            loc_q = location.strip().lower()
            match_city = loc_q in h.city.lower()
            match_area = loc_q in h.area.lower()
            match_name = loc_q in h.name.lower()
            if not (match_city or match_area or match_name):
                continue

        # Facility filter
        if facility and facility.lower() != "all":
            has_facility = any(facility.lower() in f.facility_name.lower() for f in h.facilities)
            if not has_facility:
                continue

        dist = known_distances.get(h.id, 2.5)
        resp = format_hospital_response(db, h, distance_km=dist)

        if available_only and resp.availableBeds <= 0:
            continue

        results.append(resp)

    return results

def get_hospital_dashboard_metrics(db: Session, hospital_id: str, pending_count: int) -> HospitalDashboardResponse:
    counts = get_hospital_bed_counts(db, hospital_id)
    return HospitalDashboardResponse(
        total_beds=counts["total"],
        available_beds=counts["available"],
        occupied_beds=counts["occupied"],
        reserved_beds=counts["reserved"],
        maintenance_beds=counts["maintenance"],
        pending_requests=pending_count
    )
