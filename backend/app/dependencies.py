from typing import Optional
from fastapi import Depends, HTTPException, status, Header, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import decode_access_token
from app.models.user import User
from app.models.hospital import Hospital

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/user/login", auto_error=False)

def get_current_actor(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    sub = payload.get("sub")
    role = payload.get("role")
    if role == "USER":
        user = db.query(User).filter(User.id == int(sub)).first()
        if user:
            return {"type": "USER", "entity": user}
    elif role == "HOSPITAL":
        hosp = db.query(Hospital).filter(Hospital.id == str(sub)).first()
        if hosp:
            return {"type": "HOSPITAL", "entity": hosp}
    return None

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate user credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "USER":
        raise credentials_exception
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_exception
    return user

def get_current_hospital(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Hospital:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate hospital credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "HOSPITAL":
        raise credentials_exception
    hosp_id = payload.get("sub")
    if not hosp_id:
        raise credentials_exception
    hosp = db.query(Hospital).filter(Hospital.id == str(hosp_id)).first()
    if not hosp:
        raise credentials_exception
    return hosp

def get_optional_hospital(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[Hospital]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "HOSPITAL":
        return None
    hosp_id = payload.get("sub")
    if not hosp_id:
        return None
    return db.query(Hospital).filter(Hospital.id == str(hosp_id)).first()

