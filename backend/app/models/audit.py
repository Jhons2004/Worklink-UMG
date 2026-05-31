import uuid
from sqlalchemy import Column, String, DateTime, func
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "bitacoras_auditoria"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)  # ID del usuario (estudiante, empresa, admin)
    action = Column(String(255), nullable=False)  # Descripción de la acción operativa
    ip_address = Column(String(45), nullable=False)  # Dirección IP del cliente
    timestamp = Column(DateTime, server_default=func.now())
