import uuid
from sqlalchemy import Column, String, Numeric, Text, ForeignKey, DateTime, UniqueConstraint, func
from geoalchemy2 import Geometry
from app.database import Base
from sqlalchemy.orm import relationship

def generate_uuid():
    return str(uuid.uuid4())

class JobOpening(Base):
    __tablename__ = "vacantes"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # Híbrido, Tiempo Completo, Medio Tiempo
    salary = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=False)
    location_name = Column(String(100), nullable=False)  # Nombre del municipio (ej. Guatemala, Mixco)
    
    # Ubicación geoespacial de la vacante para búsquedas por proximidad
    location_geom = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=False)
    
    company_id = Column(String, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="ACTIVA")  # ACTIVA, PAUSADA, FINALIZADA
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relaciones
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job_opening", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "postulaciones"

    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("estudiantes.id", ondelete="CASCADE"), nullable=False)
    job_opening_id = Column(String, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="ENVIADA")  # ENVIADA, EN_REVISION, ACEPTADA, RECHAZADA
    
    applied_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relaciones
    student = relationship("Student", back_populates="applications")
    job_opening = relationship("JobOpening", back_populates="applications")

    # Impedir que un alumno se postule dos veces a la misma vacante
    __table_args__ = (
        UniqueConstraint('student_id', 'job_opening_id', name='unique_student_job'),
    )
