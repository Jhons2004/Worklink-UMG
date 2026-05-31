from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.security import get_current_user
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from app.repositories import application_repository, job_repository
from app.services import email_service

router = APIRouter(prefix="/api/applications", tags=["Postulaciones"])

def map_application_response(row) -> dict:
    app, job_title, company_name, job_salary, job_location = row
    salary_formatted = f"Q{int(job_salary):,}" if job_salary else "N/A"
    return {
        "id": app.id,
        "student_id": app.student_id,
        "student_name": "",
        "student_career": None,
        "student_cv": None,
        "job_opening_id": app.job_opening_id,
        "job_title": job_title,
        "job_company": company_name,
        "job_salary": salary_formatted,
        "job_location": job_location or "",
        "status": app.status,
        "applied_at": app.applied_at,
        "updated_at": app.updated_at
    }

def map_candidate_response(row) -> dict:
    app, student_name, student_carnet, student_career, student_phone, student_biography, student_aptitudes, student_cv, student_email = row
    return {
        "id": app.id,
        "student_id": app.student_id,
        "student_name": student_name,
        "student_career": student_career or student_carnet,  # Mostrar la carrera o carnet
        "student_cv": student_cv,
        "student_phone": student_phone,
        "student_biography": student_biography,
        "student_aptitudes": student_aptitudes,
        "student_email": student_email,
        "job_opening_id": app.job_opening_id,
        "job_title": "",
        "job_company": "",
        "status": app.status,
        "applied_at": app.applied_at,
        "updated_at": app.updated_at
    }

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    request: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permite a un estudiante postularse a una vacante (exclusivo para estudiantes).
    """
    if current_user["role"] != "estudiante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo las cuentas de estudiante pueden postularse a vacantes"
        )
        
    student_id = current_user["sub"]
    job_id = request.job_opening_id
    
    # Verificar si la vacante existe
    job = job_repository.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="La vacante especificada no existe")
        
    # Verificar si ya se postuló para evitar duplicados
    existing = db.query(Application).filter(
        Application.student_id == student_id,
        Application.job_opening_id == job_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya te has postulado previamente a esta vacante"
        )
        
    app = application_repository.create_application(db, student_id, job_id)
    
    # Retornar una estructura mapeada básica
    from app.models.company import Company
    company = db.query(Company).filter(Company.id == job.company_id).first()
    company_name = company.name if company else "Empresa"

    # Notificaciones por email (antes del return)
    student_email = current_user.get("email", "")
    student_name = current_user.get("name", "Estudiante")
    if student_email:
        email_service.send_application_received_student(student_name, student_email, job.title, company_name)
    if company:
        email_service.send_new_applicant_company(
            company.email, company_name,
            student_name, current_user.get("career", ""), job.title
        )

    return {
        "id": app.id,
        "student_id": app.student_id,
        "student_name": student_name,
        "student_career": None,
        "student_cv": None,
        "job_opening_id": app.job_opening_id,
        "job_title": job.title,
        "job_company": company_name,
        "status": app.status,
        "applied_at": app.applied_at,
        "updated_at": app.updated_at
    }

from app.models.job import Application

@router.get("/my-applications", response_model=list[ApplicationResponse])
def get_my_applications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna el historial de vacantes a las que se ha postulado el estudiante autenticado.
    """
    if current_user["role"] != "estudiante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación exclusiva para estudiantes"
        )
        
    student_id = current_user["sub"]
    rows = application_repository.get_student_applications(db, student_id)
    return [map_application_response(row) for row in rows]


@router.get("/job/{job_id}", response_model=list[ApplicationResponse])
def get_job_candidates(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna la lista de candidatos que se han postulado a una vacante específica (exclusivo para la empresa creadora).
    """
    if current_user["role"] != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación exclusiva para empresas"
        )
        
    # Verificar propiedad de la plaza
    job = job_repository.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
        
    if job.company_id != current_user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver los candidatos de esta vacante"
        )
        
    rows = application_repository.get_job_applications(db, job_id)
    return [map_candidate_response(row) for row in rows]


@router.post("/status-update/{application_id}", response_model=ApplicationResponse)
def update_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el estado de una postulación (ej. ACEPTADA o RECHAZADA) por parte de la empresa creadora.
    """
    if current_user["role"] != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo las empresas pueden evaluar y actualizar el estado de las postulaciones"
        )
        
    app = application_repository.get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
        
    # Verificar propiedad de la vacante vinculada
    job = job_repository.get_job_by_id(db, app.job_opening_id)
    if not job or job.company_id != current_user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar esta postulación"
        )
        
    updated_app = application_repository.update_application_status(db, application_id, status_update.status)
    
    from app.models.company import Company
    from app.models.student import Student
    company = db.query(Company).filter(Company.id == job.company_id).first()
    company_name = company.name if company else "Empresa"
    student = db.query(Student).filter(Student.id == updated_app.student_id).first()

    # Enviar email al estudiante con el nuevo estado
    if student and student.email:
        email_service.send_application_status_update(
            student.name, student.email, job.title, company_name, status_update.status
        )

    return {
        "id": updated_app.id,
        "student_id": updated_app.student_id,
        "student_name": student.name if student else "",
        "student_career": None,
        "student_cv": None,
        "job_opening_id": updated_app.job_opening_id,
        "job_title": job.title,
        "job_company": company_name,
        "status": updated_app.status,
        "applied_at": updated_app.applied_at,
        "updated_at": updated_app.updated_at
    }
