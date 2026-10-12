import pytest
from app.models.hospital import Hospital
from app.models.facility import HospitalFacility
from app.models.bed import IcuBed
from app.services.auth_service import get_password_hash

def ensure_test_hospitals(db):
    if not db.query(Hospital).filter(Hospital.id == "test-hosp-1").first():
        h1 = Hospital(
            id="test-hosp-1",
            name="Alpha Medical Center",
            city="Chennai",
            area="Greams Road",
            type="Private",
            registration_id="REG-ALPHA-01",
            email="alpha@test.com",
            password_hash=get_password_hash("Password123!"),
            total_beds=10
        )
        db.add(h1)
        db.add(HospitalFacility(hospital_id="test-hosp-1", facility_name="Ventilator"))
        db.add(HospitalFacility(hospital_id="test-hosp-1", facility_name="Cardiac ICU"))

        db.add(IcuBed(id="BED-A1", hospital_id="test-hosp-1", bed_number="BED-A1", status="AVAILABLE", ward="ICU 1"))
        db.add(IcuBed(id="BED-A2", hospital_id="test-hosp-1", bed_number="BED-A2", status="OCCUPIED", ward="ICU 1"))

        h2 = Hospital(
            id="test-hosp-2",
            name="Beta Government Hospital",
            city="Chennai",
            area="Park Town",
            type="Government",
            registration_id="REG-BETA-02",
            email="beta@test.com",
            password_hash=get_password_hash("Password123!"),
            total_beds=15
        )
        db.add(h2)
        db.add(HospitalFacility(hospital_id="test-hosp-2", facility_name="Ventilator"))
        db.add(HospitalFacility(hospital_id="test-hosp-2", facility_name="Trauma ICU"))
        db.add(IcuBed(id="BED-B1", hospital_id="test-hosp-2", bed_number="BED-B1", status="AVAILABLE", ward="Trauma Ward"))

        db.commit()

# 1. User Registration
def test_user_registration(client):
    res = client.post("/api/auth/user/register", json={
        "name": "Dr. Tester",
        "mobile": "+91 99999 88888",
        "email": "tester@ems.gov.in",
        "password": "TestPassword123!",
        "designation": "Paramedic"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "USER"
    assert data["user"]["email"] == "tester@ems.gov.in"

# 2. User Login
def test_user_login(client):
    # Register first
    client.post("/api/auth/user/register", json={
        "name": "Login User",
        "mobile": "+91 98888 11111",
        "email": "loginuser@ems.gov.in",
        "password": "TestPassword123!",
        "designation": "Paramedic"
    })
    # Then login
    res = client.post("/api/auth/user/login", json={
        "email": "loginuser@ems.gov.in",
        "password": "TestPassword123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "USER"

# 3. Hospital Registration
def test_hospital_registration(client):
    res = client.post("/api/auth/hospital/register", json={
        "name": "City Care Hospital",
        "city": "Chennai",
        "area": "T. Nagar",
        "type": "Private",
        "registration_id": "REG-CITY-99",
        "email": "citycare@hospitals.gov.in",
        "password": "CityPassword123!",
        "total_beds": 20,
        "facilities": ["Ventilator", "Cardiac ICU"]
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "HOSPITAL"

# 4. Hospital Login
def test_hospital_login(client, db_session):
    ensure_test_hospitals(db_session)
    res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "HOSPITAL"

# 5. Hospital Search
def test_hospital_search(client, db_session):
    ensure_test_hospitals(db_session)
    res = client.get("/api/hospitals?location=Chennai")
    assert res.status_code == 200
    hospitals = res.json()
    assert len(hospitals) >= 2
    alpha = next(h for h in hospitals if h["id"] == "test-hosp-1")
    assert alpha["availableBeds"] == 1
    assert alpha["occupiedBeds"] == 1

# 6. Hospital Details
def test_hospital_details(client, db_session):
    ensure_test_hospitals(db_session)
    res = client.get("/api/hospitals/test-hosp-1")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Alpha Medical Center"
    assert "Ventilator" in data["facilities"]

# 7. Create Booking
def test_create_booking(client, db_session):
    ensure_test_hospitals(db_session)
    res = client.post("/api/bookings", json={
        "hospital_id": "test-hosp-1",
        "patient_name": "Arun Kumar",
        "patient_mobile": "+91 98888 77777",
        "severity": "Critical",
        "beds_required": 1,
        "current_location": "T. Nagar Panagal Park",
        "required_facilities": ["Ventilator"]
    })
    assert res.status_code == 201
    booking = res.json()
    assert booking["status"] == "PENDING"
    assert booking["patientName"] == "Arun Kumar"
    assert booking["id"].startswith("ICU-REQ-")

# 8. Hospital Receives Booking
def test_hospital_receives_booking(client, db_session):
    ensure_test_hospitals(db_session)
    # Create booking for Alpha
    client.post("/api/bookings", json={
        "hospital_id": "test-hosp-1",
        "patient_name": "Arun Kumar",
        "current_location": "T. Nagar"
    })

    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    res = client.get("/api/hospital/bookings", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    bookings = res.json()
    assert any(b["patientName"] == "Arun Kumar" for b in bookings)

# 9, 10, 11, 12. Accept Booking, Bed Changes AVAILABLE -> RESERVED, Booking CONFIRMED, User Notification
def test_accept_booking_workflow(client, db_session):
    ensure_test_hospitals(db_session)
    # Create booking
    b_res = client.post("/api/bookings", json={
        "hospital_id": "test-hosp-1",
        "patient_name": "Priya Nair",
        "current_location": "Central"
    })
    booking_id = b_res.json()["id"]

    # Hospital logs in
    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # Accept booking
    accept_res = client.post(
        f"/api/bookings/{booking_id}/accept",
        headers={"Authorization": f"Bearer {token}"},
        json={"bed_id": "BED-A1"}
    )
    assert accept_res.status_code == 200
    data = accept_res.json()
    assert data["status"] == "CONFIRMED"
    assert data["assignedBedId"] == "BED-A1"

    # Verify Bed changed from AVAILABLE to RESERVED in database
    beds_res = client.get("/api/hospital/beds?hospital_id=test-hosp-1")
    bed = next(b for b in beds_res.json() if b["id"] == "BED-A1")
    assert bed["status"] == "RESERVED"

    # Verify User notification created
    notifs_res = client.get("/api/notifications?portal=user")
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert any("ICU Bed Confirmed" in n["title"] for n in notifs)

# 13, 14. Reject Booking and User Receives Rejection Notification
def test_reject_booking_workflow(client, db_session):
    ensure_test_hospitals(db_session)
    # Create booking to reject
    res = client.post("/api/bookings", json={
        "hospital_id": "test-hosp-2",
        "patient_name": "Suresh Raina",
        "patient_mobile": "+91 97777 66666",
        "severity": "High",
        "current_location": "Guindy",
        "required_facilities": ["Trauma ICU"]
    })
    booking_id = res.json()["id"]

    # Beta Hospital logs in
    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-BETA-02",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # Reject booking
    reject_res = client.post(
        f"/api/bookings/{booking_id}/reject",
        headers={"Authorization": f"Bearer {token}"},
        json={"rejection_reason": "No surgical teams available due to mass casualty intake."}
    )
    assert reject_res.status_code == 200
    rejected = reject_res.json()
    assert rejected["status"] == "REJECTED"
    assert "No surgical teams" in rejected["rejectionReason"]

    # Verify user notification for rejection
    notifs_res = client.get("/api/notifications?portal=user")
    assert any("Unavailable" in n["title"] for n in notifs_res.json())

# 15. Alternative Hospital Recommendation Search
def test_alternative_recommendations(client, db_session):
    ensure_test_hospitals(db_session)
    res = client.get("/api/hospitals/recommendations?excluding_hospital_id=test-hosp-2&facility=Ventilator")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 1
    assert all(r["id"] != "test-hosp-2" for r in recs)

# 16. Unauthorized Access Blocked
def test_unauthorized_access(client):
    res = client.get("/api/hospital/dashboard")
    assert res.status_code == 401

# 17. Cannot Book Unavailable Bed
def test_cannot_allocate_unavailable_bed(client, db_session):
    ensure_test_hospitals(db_session)
    res = client.post("/api/bookings", json={
        "hospital_id": "test-hosp-1",
        "patient_name": "John Doe",
        "current_location": "Central"
    })
    b_id = res.json()["id"]

    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # Try allocating already OCCUPIED bed BED-A2
    bad_res = client.post(
        f"/api/bookings/{b_id}/accept",
        headers={"Authorization": f"Bearer {token}"},
        json={"bed_id": "BED-A2"}
    )
    assert bad_res.status_code == 400

# 18. Cannot Modify Another Hospital's Bed
def test_cannot_modify_other_hospital_bed(client, db_session):
    ensure_test_hospitals(db_session)
    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-BETA-02",
        "password": "Password123!"
    })
    beta_token = login_res.json()["access_token"]

    # Try modifying BED-A1 belonging to test-hosp-1
    res = client.patch(
        "/api/hospital/beds/BED-A1",
        headers={"Authorization": f"Bearer {beta_token}"},
        json={"status": "MAINTENANCE"}
    )
    assert res.status_code == 403

# 19. Cannot Accept Already Processed Booking
def test_cannot_accept_already_confirmed_booking(client, db_session):
    ensure_test_hospitals(db_session)
    # Create booking
    b_res = client.post("/api/bookings", json={
        "hospital_id": "test-hosp-1",
        "patient_name": "Vijay Sethupathi",
        "current_location": "Central"
    })
    booking_id = b_res.json()["id"]

    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # Accept first time
    res1 = client.post(
        f"/api/bookings/{booking_id}/accept",
        headers={"Authorization": f"Bearer {token}"},
        json={"bed_id": "BED-A1"}
    )
    assert res1.status_code == 200

    # Try accepting again
    res2 = client.post(
        f"/api/bookings/{booking_id}/accept",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 400

# 20. Real-time Status and System Status
def test_realtime_and_system_status(client, db_session):
    ensure_test_hospitals(db_session)
    rt_res = client.get("/api/realtime/status")
    assert rt_res.status_code == 200
    assert rt_res.json()["status"] == "active"

    sys_res = client.get("/api/system/status")
    assert sys_res.status_code == 200
    data = sys_res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["hospitals_count"] >= 2

# 21. Protected Routes Reject Unauthenticated Requests
def test_unauthenticated_protected_routes(client):
    # Hospital dashboard
    res1 = client.get("/api/hospital/dashboard")
    assert res1.status_code == 401

    # Hospital bookings review
    res2 = client.get("/api/hospital/bookings")
    assert res2.status_code == 401

    # Hospital bed status update
    res3 = client.patch("/api/hospital/beds/BED-A1", json={"status": "MAINTENANCE"})
    assert res3.status_code == 401

    # Hospital bed registration
    res4 = client.post("/api/hospital/beds", json={"bed_number": "ICU-999", "ward": "ICU Ward", "equipment": ["Ventilator"]})
    assert res4.status_code == 401

    # User bookings
    res5 = client.get("/api/user/bookings")
    assert res5.status_code == 401

# 22. Role-Based Access: USER Cannot Access Hospital Endpoints
def test_user_cannot_access_hospital_endpoints(client, db_session):
    ensure_test_hospitals(db_session)
    # Register and login as USER
    client.post("/api/auth/user/register", json={
        "name": "Standard User",
        "mobile": "+91 91111 22222",
        "email": "stduser@icushare.org",
        "password": "UserPass123!",
        "designation": "Patient Attendant"
    })
    login_res = client.post("/api/auth/user/login", json={
        "email": "stduser@icushare.org",
        "password": "UserPass123!"
    })
    user_token = login_res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Attempt to access hospital dashboard
    dash_res = client.get("/api/hospital/dashboard", headers=user_headers)
    assert dash_res.status_code == 401

    # Attempt to access hospital bookings review
    b_res = client.get("/api/hospital/bookings", headers=user_headers)
    assert b_res.status_code == 401

    # Attempt to modify bed status
    bed_res = client.patch("/api/hospital/beds/BED-A1", headers=user_headers, json={"status": "OCCUPIED"})
    assert bed_res.status_code == 401

# 23. Role-Based Access: HOSPITAL Cannot Access User Endpoints
def test_hospital_cannot_access_user_endpoints(client, db_session):
    ensure_test_hospitals(db_session)
    # Login as HOSPITAL
    login_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    hosp_token = login_res.json()["access_token"]
    hosp_headers = {"Authorization": f"Bearer {hosp_token}"}

    # Attempt to access user-only bookings
    res = client.get("/api/user/bookings", headers=hosp_headers)
    assert res.status_code == 401

# 24. Invalid and Expired Tokens are Rejected
def test_invalid_and_expired_tokens(client):
    # Invalid token format
    res1 = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-valid-token"})
    assert res1.status_code == 401

    # Tampered signature
    res2 = client.get("/api/auth/me", headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IlVTRVIifQ.invalidsignature"})
    assert res2.status_code == 401

    # Expired token (using negative delta)
    from datetime import timedelta
    from app.services.auth_service import create_access_token
    expired_token = create_access_token({"sub": "1", "role": "USER"}, expires_delta=timedelta(minutes=-10))
    res3 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res3.status_code == 401

# 25. Auth /me Endpoint Returns Validated Identity
def test_auth_me_validates_identity(client, db_session):
    ensure_test_hospitals(db_session)
    # Register user first
    client.post("/api/auth/user/register", json={
        "name": "Session User",
        "mobile": "+91 97777 88888",
        "email": "sessionuser@ems.gov.in",
        "password": "TestPassword123!",
        "designation": "Paramedic"
    })
    # User /me
    u_res = client.post("/api/auth/user/login", json={
        "email": "sessionuser@ems.gov.in",
        "password": "TestPassword123!"
    })
    assert u_res.status_code == 200
    u_token = u_res.json()["access_token"]
    me_user = client.get("/api/auth/me", headers={"Authorization": f"Bearer {u_token}"})
    assert me_user.status_code == 200
    assert me_user.json()["role"] == "USER"
    assert me_user.json()["user"]["email"] == "sessionuser@ems.gov.in"

    # Hospital /me
    h_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    assert h_res.status_code == 200
    h_token = h_res.json()["access_token"]
    me_hosp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {h_token}"})
    assert me_hosp.status_code == 200
    assert me_hosp.json()["role"] == "HOSPITAL"
    assert me_hosp.json()["hospital"]["id"] == "test-hosp-1"

# 26. Demo Accounts Authenticate via Normal Endpoints
def test_demo_accounts_authenticate(client, db_session):
    ensure_test_hospitals(db_session)
    # Hospital demo login
    hosp_res = client.post("/api/auth/hospital/login", json={
        "registration_id": "REG-ALPHA-01",
        "password": "Password123!"
    })
    assert hosp_res.status_code == 200
    assert "access_token" in hosp_res.json()
    assert hosp_res.json()["role"] == "HOSPITAL"



