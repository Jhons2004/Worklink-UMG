from pydantic import BaseModel, Field
from datetime import datetime

class ApplicationCreate(BaseModel):
    job_opening_id: str

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="ENVIADA, EN_REVISION, ACEPTADA, RECHAZADA")

class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_career: str | None = None
    student_cv: str | None = None
    student_phone: str | None = None
    student_biography: str | None = None
    student_email: str | None = None
    job_opening_id: str
    job_title: str
    job_company: str
    job_salary: str | None = None
    job_location: str | None = None
    status: str
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        model_config = {"from_attributes": True}
