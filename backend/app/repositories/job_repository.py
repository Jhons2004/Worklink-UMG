from sqlalchemy import cast
from sqlalchemy.orm import Session
from geoalchemy2 import Geography
from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_DWithin, ST_Distance

from app.models.job import JobOpening
from app.models.company import Company
from app.schemas.job import JobCreate

def create_job_opening(db: Session, job_in: JobCreate, company_id: str) -> JobOpening:
    # POINT(long lat)
    geom = WKTElement(f"POINT({job_in.longitude} {job_in.latitude})", srid=4326)
    
    # Generar el salary_label formateado para el frontend (ej. Q8,500)
    salary_label = f"Q{int(job_in.salary):,}"
    
    db_job = JobOpening(
        title=job_in.title,
        type=job_in.type,
        salary=job_in.salary,
        salary_label=salary_label,
        description=job_in.description,
        location_name=job_in.location_name,
        location_geom=geom,
        company_id=company_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_company_jobs(db: Session, company_id: str) -> list[JobOpening]:
    return db.query(JobOpening).filter(JobOpening.company_id == company_id).order_by(JobOpening.created_at.desc()).all()

def get_job_by_id(db: Session, job_id: str) -> JobOpening | None:
    return db.query(JobOpening).filter(JobOpening.id == job_id).first()

def get_jobs_nearby(db: Session, student_lat: float, student_lng: float, radius_meters: float = 15000) -> list:
    """
    Retorna las vacantes cercanas al estudiante usando PostGIS.
    Hace cast a Geography para que la distancia y filtros se midan en metros.
    """
    student_point = WKTElement(f"POINT({student_lng} {student_lat})", srid=4326)
    
    # Cast a Geography de PostGIS para medir en metros sobre la esfera terrestre
    geom_geog = cast(JobOpening.location_geom, Geography)
    point_geog = cast(student_point, Geography)
    
    # Realizar la consulta combinando vacantes con el nombre de la empresa y la distancia calculada
    query = db.query(
        JobOpening,
        Company.name.label("company_name"),
        ST_Distance(geom_geog, point_geog).label("distance_meters")
    ).join(
        Company, JobOpening.company_id == Company.id
    ).filter(
        ST_DWithin(geom_geog, point_geog, radius_meters),
        JobOpening.status == "ACTIVA"
    ).order_by(
        ST_Distance(geom_geog, point_geog)
    )
    
    return query.all()
