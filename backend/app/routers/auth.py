from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.hospital import HospitalCreate, HospitalLogin, HospitalResponse
from app.services.auth_service import verify_password, get_password_hash, create_access_token
from app.services.hospital_service import format_hospital_response
from app.dependencies import get_current_actor

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/user/register", response_model=TokenResponse)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if db.query(User).filter((User.email == data.email) | (User.mobile == data.mobile)).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or mobile is already registered."
        )

    new_user = User(
        name=data.name,
        mobile=data.mobile,
        email=data.email,
        password_hash=get_password_hash(data.password),
        designation=data.designation or "Emergency Attendant / Family",
        role="USER"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": "USER", "name": new_user.name})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="USER",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/user/login", response_model=TokenResponse)
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    user = None
    if data.email:
        user = db.query(User).filter(User.email == data.email).first()
    elif data.mobile:
        user = db.query(User).filter(User.mobile == data.mobile).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email/phone and password."
        )

    token = create_access_token({"sub": str(user.id), "role": "USER", "name": user.name})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="USER",
        user=UserResponse.model_validate(user)
    )

@router.post("/hospital/register", response_model=TokenResponse)
def register_hospital(data: HospitalCreate, db: Session = Depends(get_db)):
    if db.query(Hospital).filter(
        (Hospital.registration_id == data.registration_id) | (Hospital.email == data.email)
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hospital with this registration ID or email already registered."
        )

    hosp_id = f"hosp-{db.query(Hospital).count() + 1}"
    new_hosp = Hospital(
        id=hosp_id,
        name=data.name,
        city=data.city,
        area=data.area,
        address=data.address,
        type=data.type,
        phone=data.phone,
        emergency_contact=data.emergency_contact,
        doctor_in_charge=data.doctor_in_charge,
        node_id=data.node_id or f"H{100 + db.query(Hospital).count() + 1}",
        desk=data.desk or "Emergency Triaging Command",
        registration_id=data.registration_id,
        email=data.email,
        password_hash=get_password_hash(data.password),
        total_beds=data.total_beds
    )
    db.add(new_hosp)
    db.commit()
    db.refresh(new_hosp)

    token = create_access_token({"sub": new_hosp.id, "role": "HOSPITAL", "name": new_hosp.name})
    hosp_resp = format_hospital_response(db, new_hosp)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="HOSPITAL",
        hospital=hosp_resp.model_dump()
    )

@router.post("/hospital/login", response_model=TokenResponse)
def login_hospital(data: HospitalLogin, db: Session = Depends(get_db)):
    hosp = None
    if data.registration_id:
        hosp = db.query(Hospital).filter(Hospital.registration_id == data.registration_id).first()
    elif data.email:
        hosp = db.query(Hospital).filter(Hospital.email == data.email).first()

    if not hosp or not verify_password(data.password, hosp.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your Institutional ID/Email and password."
        )

    token = create_access_token({"sub": hosp.id, "role": "HOSPITAL", "name": hosp.name})
    hosp_resp = format_hospital_response(db, hosp)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="HOSPITAL",
        hospital=hosp_resp.model_dump()
    )

@router.get("/me")
def get_current_session(actor: dict = Depends(get_current_actor), db: Session = Depends(get_db)):
    if not actor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if actor["type"] == "USER":
        return {"role": "USER", "user": UserResponse.model_validate(actor["entity"])}
    elif actor["type"] == "HOSPITAL":
        return {"role": "HOSPITAL", "hospital": format_hospital_response(db, actor["entity"]).model_dump()}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown role")
