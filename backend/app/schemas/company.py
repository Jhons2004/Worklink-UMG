from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    website: str | None = Field(None, max_length=100)

class CompanyCreate(CompanyBase):
    password: str = Field(..., min_length=6)
    latitude: float | None = None
    longitude: float | None = None

class CompanyResponse(CompanyBase):
    id: str
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
