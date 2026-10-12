"""
Rule-Based Alternative Hospital Recommendation Service
Academic Prototype Decision-Support Engine

Note: This is an explicit rule-based multi-criteria suitability scoring model,
NOT machine learning or clinical diagnosis.

Formula:
  Suitability Score (S) = w1 * A + w2 * F + w3 * D + w4 * T
Where:
  - A (Availability): Scaled available ICU bed capacity (0.0 to 1.0)
  - F (Facility Match): Proportion of required facilities supported (0.0 to 1.0)
  - D (Distance Proximity): Normalized inverse transit distance (0.0 to 1.0)
  - T (Hospital Type / Tier Factor): Institutional weighting (Government vs Private)
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.hospital import Hospital
from app.services.hospital_service import format_hospital_response, get_hospital_bed_counts
from app.schemas.hospital import HospitalResponse

def get_recommended_alternatives(
    db: Session,
    excluding_hospital_id: str,
    required_facilities: Optional[List[str]] = None,
    preferred_type: Optional[str] = None
) -> List[HospitalResponse]:
    all_hospitals = db.query(Hospital).filter(Hospital.id != excluding_hospital_id).all()
    scored_hospitals = []

    # Distances map from simulation mesh
    known_distances = {
        "hosp-1": 1.8,
        "hosp-2": 4.2,
        "hosp-3": 2.8,
        "hosp-4": 3.2,
        "hosp-5": 2.6,
        "hosp-6": 1.9,
    }

    # Weights
    w1_avail = 0.40
    w2_facilities = 0.30
    w3_dist = 0.20
    w4_type = 0.10

    req_set = set([f.lower() for f in (required_facilities or ["Ventilator"])])

    for h in all_hospitals:
        counts = get_hospital_bed_counts(db, h.id)
        avail = counts["available"]

        # Only recommend facilities with active intake capability
        if avail <= 0:
            continue

        h_facilities = set([f.facility_name.lower() for f in h.facilities])

        # 1. Availability factor A (capped at 15 beds for normalization)
        factor_a = min(avail / 15.0, 1.0)

        # 2. Facility match factor F
        matching_facilities = req_set.intersection(h_facilities)
        factor_f = len(matching_facilities) / max(len(req_set), 1)

        # 3. Distance proximity factor D (closer = higher score)
        dist = known_distances.get(h.id, 3.0)
        factor_d = max(0.0, 1.0 - (dist / 10.0))

        # 4. Hospital type factor T
        factor_t = 1.0
        if preferred_type and preferred_type.lower() != "all":
            factor_t = 1.0 if h.type.lower() == preferred_type.lower() else 0.5

        # Total Suitability Score
        score = (w1_avail * factor_a) + (w2_facilities * factor_f) + (w3_dist * factor_d) + (w4_type * factor_t)

        resp = format_hospital_response(db, h, distance_km=dist)
        scored_hospitals.append((score, resp))

    # Sort descending by rule-based suitability score
    scored_hospitals.sort(key=lambda x: x[0], reverse=True)

    return [item[1] for item in scored_hospitals]
