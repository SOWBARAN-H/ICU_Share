from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    name: str
    mobile: str
    email: str
    designation: Optional[str] = "Emergency Attendant / Family"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: Optional[str] = None
    mobile: Optional[str] = None
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: Optional[UserResponse] = None
    hospital: Optional[dict] = None
