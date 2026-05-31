from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.database import get_db
from app.services.security import get_current_user
from app.models.student import Student
from app.models.company import Company
from app.models.job import JobOpening, Application
from app.services.auth_service import hash_password, verify_password, create_access_token
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ─── Schemas ──────────────────────────────────────────────
class AdminLogin(BaseModel):
    password: str

# ─── Dependencia: solo admin ───────────────────────────────
def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acceso exclusivo para administradores")
    return current_user

# ─── Login de admin (usuario fijo en .env / hardcoded seguro) ─
@router.post("/login")
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):
    """
    Login especial para el panel administrador.
    Credenciales por defecto: password = WorkLinkAdmin2025!
    """
    ADMIN_PASSWORD = "WorkLinkAdmin2025!"
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Contraseña de administrador incorrecta")

    token = create_access_token(
        {"sub": "admin", "role": "admin", "name": "Administrador WorkLink"},
        expires_delta=timedelta(hours=8)
    )
    return {"access_token": token, "token_type": "bearer", "role": "admin"}


# ─── Dashboard: métricas globales ─────────────────────────
@router.get("/stats")
def get_global_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    total_students = db.query(func.count(Student.id)).scalar()
    total_companies = db.query(func.count(Company.id)).scalar()
    total_jobs = db.query(func.count(JobOpening.id)).scalar()
    total_applications = db.query(func.count(Application.id)).scalar()
    accepted = db.query(func.count(Application.id)).filter(Application.status == "ACEPTADA").scalar()
    rejected = db.query(func.count(Application.id)).filter(Application.status == "RECHAZADA").scalar()
    pending = db.query(func.count(Application.id)).filter(Application.status == "ENVIADA").scalar()

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "applications_accepted": accepted,
        "applications_rejected": rejected,
        "applications_pending": pending,
    }


# ─── Reportes: postulaciones por carrera ──────────────────
@router.get("/reports/by-career")
def report_by_career(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = (
        db.query(Student.career, func.count(Application.id).label("total"))
        .join(Application, Application.student_id == Student.id)
        .group_by(Student.career)
        .order_by(func.count(Application.id).desc())
        .limit(10)
        .all()
    )
    return [{"career": r.career or "Sin especificar", "total": r.total} for r in rows]


# ─── Reportes: empresas más activas ───────────────────────
@router.get("/reports/top-companies")
def report_top_companies(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = (
        db.query(Company.name, func.count(JobOpening.id).label("total_jobs"))
        .join(JobOpening, JobOpening.company_id == Company.id)
        .group_by(Company.name)
        .order_by(func.count(JobOpening.id).desc())
        .limit(10)
        .all()
    )
    return [{"company": r.name, "total_jobs": r.total_jobs} for r in rows]


# ─── Reportes: municipios con más vacantes ─────────────────
@router.get("/reports/by-location")
def report_by_location(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = (
        db.query(JobOpening.location_name, func.count(JobOpening.id).label("total"))
        .group_by(JobOpening.location_name)
        .order_by(func.count(JobOpening.id).desc())
        .all()
    )
    return [{"location": r.location_name, "total": r.total} for r in rows]


# ─── Listado de todos los estudiantes ─────────────────────
@router.get("/students")
def list_students(db: Session = Depends(get_db), _=Depends(require_admin)):
    students = db.query(Student).order_by(Student.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "carnet": s.carnet,
            "career": s.career,
            "created_at": s.created_at,
        }
        for s in students
    ]


# ─── Listado de todas las empresas ────────────────────────
@router.get("/companies")
def list_companies(db: Session = Depends(get_db), _=Depends(require_admin)):
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "website": c.website,
            "created_at": c.created_at,
        }
        for c in companies
    ]


# ─── Listado de todas las vacantes ────────────────────────
@router.get("/jobs")
def list_jobs(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = (
        db.query(JobOpening, Company.name.label("company_name"))
        .join(Company, JobOpening.company_id == Company.id)
        .order_by(JobOpening.created_at.desc())
        .all()
    )
    return [
        {
            "id": j.id,
            "title": j.title,
            "type": j.type,
            "salary": float(j.salary),
            "location": j.location_name,
            "company": r.company_name,
            "status": j.status,
            "created_at": j.created_at,
        }
        for j, r in [(row[0], row) for row in rows]
    ]


# ─── Eliminar usuario estudiante ──────────────────────────
@router.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    db.delete(student)
    db.commit()
    return {"message": f"Estudiante {student.name} eliminado correctamente"}


# ─── Eliminar empresa ──────────────────────────────────────
@router.delete("/companies/{company_id}")
def delete_company(company_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    db.delete(company)
    db.commit()
    return {"message": f"Empresa {company.name} eliminada correctamente"}
