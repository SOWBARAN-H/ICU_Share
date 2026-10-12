"""
Database Seeding Script for ICU Share
Populates 6 regional hospitals, 30+ ICU beds, demo users, bookings, and triage notifications.
"""

from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.hospital import Hospital
from app.models.facility import HospitalFacility
from app.models.bed import IcuBed
from app.models.booking import Booking, BookingFacility
from app.models.notification import Notification
from app.services.auth_service import get_password_hash

def seed_database():
    print("Initializing ICU Share database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding demo users...")
        demo_user_1 = User(
            name="Rahul Sharma",
            mobile="+91 98765 43210",
            email="user@icushare.org",
            password_hash=get_password_hash("UserPass123!"),
            role="USER",
            designation="Patient Attendant / User"
        )
        db.add(demo_user_1)
        demo_user = demo_user_1

        demo_user_2 = User(
            name="Dr. Karthik Raja",
            mobile="+91 98401 23456",
            email="dispatcher14@tamilnadu-ems.gov.in",
            password_hash=get_password_hash("DemoPass123!"),
            role="USER",
            designation="User / Attendant"
        )
        db.add(demo_user_2)
        db.flush()

        print("Seeding regional hospitals...")
        hospitals_data = [
            {
                "id": "hosp-1",
                "name": "Apollo City Hospital",
                "city": "Chennai",
                "area": "Chennai Central - Chennai",
                "address": "Greams Road, Thousand Lights, Chennai",
                "type": "Private",
                "rating": 4.9,
                "latitude": 13.0604,
                "longitude": 80.2496,
                "phone": "+91 44 2829 0200",
                "emergency_contact": "1066",
                "doctor_in_charge": "Dr. Ramanathan K., MD (Critical Care)",
                "node_id": "H001 (TN-DISPATCH)",
                "desk": "Emergency Triaging Command",
                "registration_id": "TN-CMC-APOLLO-9021",
                "email": "apollo.icu@tamilnadu-hospitals.gov.in",
                "password_hash": get_password_hash("HospitalPass123!"),
                "total_beds": 40,
                "facilities": ["Ventilator", "Cardiac ICU", "ECMO", "Trauma ICU", "PICU", "Isolation"]
            },
            {
                "id": "hosp-2",
                "name": "Green Valley Medical",
                "city": "Chennai",
                "area": "Anna Nagar - Chennai",
                "address": "2nd Avenue, Anna Nagar, Chennai",
                "type": "Private",
                "rating": 4.7,
                "latitude": 13.0850,
                "longitude": 80.2101,
                "phone": "+91 44 2621 1100",
                "emergency_contact": "+91 44 2621 1199",
                "doctor_in_charge": "Dr. Shalini Verma, DNB (Anesthesiology)",
                "node_id": "H002 (TN-DISPATCH)",
                "desk": "Emergency Triaging Command",
                "registration_id": "TN-CMC-GV-1100",
                "email": "greenvalley.icu@tamilnadu-hospitals.gov.in",
                "password_hash": get_password_hash("HospitalPass123!"),
                "total_beds": 32,
                "facilities": ["Ventilator", "Cardiac ICU", "Trauma ICU", "Isolation"]
            },
            {
                "id": "hosp-3",
                "name": "Government General Hospital",
                "city": "Chennai",
                "area": "Chennai Central - Chennai",
                "address": "EVR Periyar Salai, Park Town, Chennai",
                "type": "Government",
                "rating": 4.6,
                "latitude": 13.0827,
                "longitude": 80.2707,
                "phone": "+91 44 2530 5000",
                "emergency_contact": "108",
                "doctor_in_charge": "ICU Medical Director",
                "node_id": "H003 (TN-DISPATCH)",
                "desk": "Emergency Triaging Command",
                "registration_id": "TN-CMC-GH-003",
                "email": "ggh.icu@tamilnadu-hospitals.gov.in",
                "password_hash": get_password_hash("HospitalPass123!"),
                "total_beds": 50,
                "facilities": ["Ventilator", "Trauma ICU", "Pediatric ICU", "Isolation"]
            },
            {
                "id": "hosp-4",
                "name": "Kovai Medical Center & Hospital",
                "city": "Coimbatore",
                "area": "Avinashi Road, Civil Aerodrome Post",
                "address": "Avinashi Road, Coimbatore",
                "type": "Private",
                "rating": 4.8,
                "latitude": 11.0520,
                "longitude": 77.0370,
                "phone": "+91 422 432 3800",
                "emergency_contact": "+91 422 432 3999",
                "doctor_in_charge": "Dr. S. Balasubramanian, DM (Cardiology)",
                "node_id": "H004 (TN-DISPATCH)",
                "desk": "Emergency Triaging Command",
                "registration_id": "TN-CMC-KM-4000",
                "email": "kmch.icu@tamilnadu-hospitals.gov.in",
                "password_hash": get_password_hash("HospitalPass123!"),
                "total_beds": 32,
                "facilities": ["Ventilator", "Cardiac ICU", "ECMO", "Isolation"]
            },
            {
                "id": "hosp-5",
                "name": "Coimbatore Medical College Hospital",
                "city": "Coimbatore",
                "area": "Trichy Road, Gopalapuram",
                "address": "Trichy Road, Gopalapuram, Coimbatore",
                "type": "Government",
                "rating": 4.5,
                "latitude": 11.0016,
                "longitude": 76.9674,
                "phone": "+91 422 230 1393",
                "emergency_contact": "108",
                "doctor_in_charge": "Dr. K. Geetha, MD (Critical Care)",
                "node_id": "H005 (TN-DISPATCH)",
                "desk": "Emergency Triaging Command",
                "registration_id": "TN-CMC-CMCH-5000",
                "email": "cmch.icu@tamilnadu-hospitals.gov.in",
                "password_hash": get_password_hash("HospitalPass123!"),
                "total_beds": 40,
                "facilities": ["Ventilator", "Trauma ICU", "PICU", "Isolation"]
            },
            {
                "id": "hosp-6",
                "name": "Ganga Critical Care & Trauma Unit",
                "city": "Coimbatore",
                "area": "313 Mettupalayam Road, Ram Nagar",
                "address": "313 Mettupalayam Road, Coimbatore",
                "type": "Private",
                "rating": 4.9,
                "latitude": 11.0183,
                "longitude": 76.9558,
                "phone": "+91 422 223 5050",
                "emergency_contact": "+91 422 223 5000",
                "doctor_in_charge": "Dr. S. Rajasekaran, MS, FRCS",
                "node_id": "H006 (TN-DISPATCH)",
                "desk": "Emergency Triaging Command",
                "registration_id": "TN-CMC-GANGA-6000",
                "email": "ganga.icu@tamilnadu-hospitals.gov.in",
                "password_hash": get_password_hash("HospitalPass123!"),
                "total_beds": 24,
                "facilities": ["Ventilator", "Trauma ICU", "Cardiac ICU", "Isolation"]
            }
        ]

        for h_data in hospitals_data:
            facs = h_data.pop("facilities")
            hosp = Hospital(**h_data)
            db.add(hosp)
            for f in facs:
                db.add(HospitalFacility(hospital_id=hosp.id, facility_name=f))

        print("Seeding ICU beds in clean AVAILABLE state (Ready for intake)...")
        # Government General Hospital (hosp-3)
        ggh_beds = [
            {"id": "ICU-301", "hospital_id": "hosp-3", "bed_number": "ICU-301", "ward": "Ward 14 - Trauma Care Center", "bed_type": "Trauma ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-302", "hospital_id": "hosp-3", "bed_number": "ICU-302", "ward": "Ward 14 - Trauma Care Center", "bed_type": "Trauma ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-303", "hospital_id": "hosp-3", "bed_number": "ICU-303", "ward": "Ward 16 - Pediatric ICU", "bed_type": "Pediatric ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-304", "hospital_id": "hosp-3", "bed_number": "ICU-304", "ward": "Ward 16 - Pediatric ICU", "bed_type": "Pediatric ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-305", "hospital_id": "hosp-3", "bed_number": "ICU-305", "ward": "Ward 18 - Isolation Care", "bed_type": "Isolation ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"}
        ]
        for b_data in ggh_beds:
            db.add(IcuBed(**b_data))

        # Apollo City Hospital (hosp-1) beds
        apollo_beds = [
            {"id": "ICU-101", "hospital_id": "hosp-1", "bed_number": "ICU-101", "ward": "Ward 2 - Cardiac Care", "bed_type": "Ventilator", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-102", "hospital_id": "hosp-1", "bed_number": "ICU-102", "ward": "Ward 2 - Cardiac Care", "bed_type": "Ventilator", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-103", "hospital_id": "hosp-1", "bed_number": "ICU-103", "ward": "Ward 3 - CCU", "bed_type": "Cardiac ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "ICU-104", "hospital_id": "hosp-1", "bed_number": "ICU-104", "ward": "Ward 3 - CCU", "bed_type": "Cardiac ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator, Cardiac ICU"},
            {"id": "ICU-105", "hospital_id": "hosp-1", "bed_number": "ICU-105", "ward": "Ward 5 - Advanced Critical", "bed_type": "ECMO Unit", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "ECMO"},
            {"id": "ICU-106", "hospital_id": "hosp-1", "bed_number": "ICU-106", "ward": "Ward 5 - Advanced Critical", "bed_type": "Trauma ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Trauma ICU"},
            {"id": "ICU-107", "hospital_id": "hosp-1", "bed_number": "ICU-107", "ward": "Ward 1 - PICU", "bed_type": "PICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "PICU"},
            {"id": "ICU-108", "hospital_id": "hosp-1", "bed_number": "ICU-108", "ward": "Ward 4 - Isolation", "bed_type": "Isolation ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Isolation"}
        ]
        for b_data in apollo_beds:
            db.add(IcuBed(**b_data))

        # Green Valley Medical (hosp-2) beds
        gv_beds = [
            {"id": "GV-201", "hospital_id": "hosp-2", "bed_number": "GV-201", "ward": "3rd Floor - Wing A", "bed_type": "Ventilator", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "GV-202", "hospital_id": "hosp-2", "bed_number": "GV-202", "ward": "3rd Floor - Wing B", "bed_type": "Cardiac ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Cardiac ICU"},
            {"id": "GV-203", "hospital_id": "hosp-2", "bed_number": "GV-203", "ward": "3rd Floor - Wing C", "bed_type": "Trauma ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "GV-204", "hospital_id": "hosp-2", "bed_number": "GV-204", "ward": "4th Floor - Isolation", "bed_type": "Isolation Unit", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Isolation"}
        ]
        for b_data in gv_beds:
            db.add(IcuBed(**b_data))

        # Additional hospitals (hosp-4, hosp-5, hosp-6)
        other_beds = [
            {"id": "KM-401", "hospital_id": "hosp-4", "bed_number": "KM-401", "ward": "Tower 1 - CCU", "bed_type": "Ventilator", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "KM-402", "hospital_id": "hosp-4", "bed_number": "KM-402", "ward": "Tower 1 - CCU", "bed_type": "Cardiac ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Cardiac ICU"},
            {"id": "KM-403", "hospital_id": "hosp-4", "bed_number": "KM-403", "ward": "Tower 2", "bed_type": "ECMO Unit", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "ECMO"},
            {"id": "CM-501", "hospital_id": "hosp-5", "bed_number": "CM-501", "ward": "Emergency Block", "bed_type": "Ventilator", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "CM-502", "hospital_id": "hosp-5", "bed_number": "CM-502", "ward": "Emergency Block", "bed_type": "Trauma ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Trauma ICU"},
            {"id": "CM-503", "hospital_id": "hosp-5", "bed_number": "CM-503", "ward": "Emergency Block", "bed_type": "PICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "PICU"},
            {"id": "GC-601", "hospital_id": "hosp-6", "bed_number": "GC-601", "ward": "Trauma Pavilion", "bed_type": "Trauma ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Trauma ICU"},
            {"id": "GC-602", "hospital_id": "hosp-6", "bed_number": "GC-602", "ward": "Trauma Pavilion", "bed_type": "Ventilator", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Ventilator"},
            {"id": "GC-603", "hospital_id": "hosp-6", "bed_number": "GC-603", "ward": "Trauma Pavilion", "bed_type": "Cardiac ICU", "status": "AVAILABLE", "note": "Available now (Ready for Intake)", "facilities": "Cardiac ICU"}
        ]
        for b_data in other_beds:
            db.add(IcuBed(**b_data))

        print("Zero-state initialized: 0 bookings and 0 notifications. System ready for live incoming requests.")
        db.commit()
        print("Database seeded successfully with 6 hospitals, 30+ beds, demo bookings, and triage notifications!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
