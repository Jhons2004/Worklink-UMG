import uuid
from sqlalchemy import Column, String, DateTime, func
from geoalchemy2 import Geometry
from app.database import Base
from sqlalchemy.orm import relationship

def generate_uuid():
    return str(uuid.uuid4())

class Company(Base):
    __tablename__ = "empresas"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # Para autenticación
    website = Column(String(100), nullable=True)
    
    # Ubicación geográfica de la empresa
    location_geom = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relación con las plazas de trabajo publicadas
    jobs = relationship("JobOpening", back_populates="company", cascade="all, delete-orphan")
