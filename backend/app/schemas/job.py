from pydantic import BaseModel, Field
from datetime import datetime

class JobBase(BaseModel):
    title: str = Field(..., max_length=100)
    type: str = Field(..., description="Híbrido, Tiempo Completo, Medio Tiempo")
    salary: float
    description: str
    location_name: str  # Municipio (ej. Mixco, Guatemala)

class JobCreate(JobBase):
    latitude: float
    longitude: float

class JobResponse(JobBase):
    id: str
    company_id: str
    company_name: str
    latitude: float
    longitude: float
    status: str
    distance_meters: float | None = None  # Distancia calculada en matching espacial
    applicants_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        # Soporta Pydantic v2
        model_config = {"from_attributes": True}
        # Para compatibilidad con ambas versiones de pydantic
