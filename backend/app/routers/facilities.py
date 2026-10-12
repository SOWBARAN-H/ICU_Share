from typing import List
from fastapi import APIRouter

router = APIRouter(prefix="/facilities", tags=["Facilities"])

REGIONAL_FACILITIES = [
    "Ventilator",
    "Cardiac ICU",
    "ECMO",
    "Trauma ICU",
    "PICU",
    "Isolation"
]

@router.get("", response_model=List[str])
def list_supported_facilities():
    return REGIONAL_FACILITIES
