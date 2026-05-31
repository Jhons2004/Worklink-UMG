from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class StudentBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    carnet: str = Field(..., max_length=50)
    career: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=20)
    biography: str | None = None
    aptitudes: str | None = None

class StudentCreate(StudentBase):
    password: str = Field(..., min_length=6)
    latitude: float | None = None
    longitude: float | None = None

class StudentResponse(StudentBase):
    id: str
    cv_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        # En Pydantic v2 esto se configura como:
        # model_config = {"from_attributes": True}
        # Sin embargo, from_attributes = True en Config funciona bien.
