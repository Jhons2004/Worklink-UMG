import uuid
from sqlalchemy import Column, String, Text, DateTime, func
from geoalchemy2 import Geometry
from app.database import Base
from sqlalchemy.orm import relationship

def generate_uuid():
    return str(uuid.uuid4())

class Student(Base):
    __tablename__ = "estudiantes"

    id = Column(String, primary_key=True, default=generate_uuid)
    carnet = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # Para fallback de login manual
    career = Column(String(100), nullable=True)  # Carrera del estudiante (ej. Ingeniería en Sistemas)
    phone = Column(String(20), nullable=True)
    biography = Column(Text, nullable=True)
    aptitudes = Column(Text, nullable=True)
    cv_url = Column(String(255), nullable=True)
    
    # Columna geoespacial para almacenar coordenadas GPS (latitud y longitud)
    # spatial_index=True crea automáticamente un índice espacial Gist
    location_geom = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relación con postulaciones
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
