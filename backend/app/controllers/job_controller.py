from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape

from app.database import get_db
from app.services.security import get_current_user
from app.schemas.job import JobCreate, JobResponse
from app.repositories import job_repository
from app.models.job import JobOpening
from app.models.student import Student

router = APIRouter(prefix="/api/jobs", tags=["Vacantes"])

def map_job_response(job: JobOpening, company_name: str, distance_meters: float | None = None) -> dict:
    point = to_shape(job.location_geom)
    lat = point.y
    lng = point.x
    return {
        "id": job.id,
        "title": job.title,
        "type": job.type,
        "salary": float(job.salary),
        "description": job.description,
        "location_name": job.location_name,
        "company_id": job.company_id,
        "company_name": company_name,
        "latitude": lat,
        "longitude": lng,
        "status": job.status,
        "distance_meters": distance_meters,
        "applicants_count": len(job.applications) if job.applications else 0,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Publica una nueva vacante georreferenciada (exclusivo para empresas).
    """
    if current_user["role"] != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo las cuentas corporativas pueden publicar plazas"
        )
        
    company_id = current_user["sub"]
    job = job_repository.create_job_opening(db, job_in, company_id)
    
    # Obtener el nombre de la empresa de la sesión
    company_name = current_user.get("name", "Mi Empresa")
    return map_job_response(job, company_name)


@router.get("/my-jobs", response_model=list[JobResponse])
def get_my_jobs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna la lista de vacantes publicadas por la empresa autenticada.
    """
    if current_user["role"] != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación exclusiva para cuentas corporativas"
        )
        
    company_id = current_user["sub"]
    jobs = job_repository.get_company_jobs(db, company_id)
    company_name = current_user.get("name", "Mi Empresa")
    
    return [map_job_response(j, company_name) for j in jobs]


@router.get("/nearby", response_model=list[JobResponse])
def get_nearby_jobs(
    radius_km: float = 15.0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna la lista de vacantes cercanas a la ubicación residencial del estudiante.
    Si el estudiante no tiene coordenadas definidas, se toma el centro geográfico de la capital.
    """
    if current_user["role"] != "estudiante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La búsqueda de vacantes cercanas es exclusiva para estudiantes"
        )
        
    student_id = current_user["sub"]
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    # Coordenadas por defecto (Guatemala Centro)
    lat = 14.6133
    lng = -90.5367
    
    if student.location_geom is not None:
        point = to_shape(student.location_geom)
        lat = point.y
        lng = point.x
        
    # Convertir km a metros
    radius_meters = radius_km * 1000.0
    
    results = job_repository.get_jobs_nearby(db, lat, lng, radius_meters)
    
    response_list = []
    for job, company_name, distance in results:
        response_list.append(map_job_response(job, company_name, distance))
        
    return response_list
