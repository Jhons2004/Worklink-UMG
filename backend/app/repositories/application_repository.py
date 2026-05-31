from sqlalchemy.orm import Session
from app.models.job import Application, JobOpening
from app.models.student import Student
from app.models.company import Company

def create_application(db: Session, student_id: str, job_opening_id: str) -> Application:
    db_app = Application(
        student_id=student_id,
        job_opening_id=job_opening_id,
        status="ENVIADA"
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_application_by_id(db: Session, application_id: str) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).first()

def get_student_applications(db: Session, student_id: str) -> list:
    """
    Retorna la lista de postulaciones del estudiante uniendo los detalles del puesto y empresa.
    """
    return db.query(
        Application,
        JobOpening.title.label("job_title"),
        Company.name.label("company_name"),
        JobOpening.salary.label("job_salary"),
        JobOpening.location_name.label("job_location")
    ).join(
        JobOpening, Application.job_opening_id == JobOpening.id
    ).join(
        Company, JobOpening.company_id == Company.id
    ).filter(
        Application.student_id == student_id
    ).order_by(
        Application.applied_at.desc()
    ).all()

def get_job_applications(db: Session, job_opening_id: str) -> list:
    """
    Retorna las postulaciones a una plaza específica con los datos de contacto y CV del estudiante.
    """
    return db.query(
        Application,
        Student.name.label("student_name"),
        Student.carnet.label("student_carnet"),
        Student.career.label("student_career"),
        Student.phone.label("student_phone"),
        Student.biography.label("student_biography"),
        Student.aptitudes.label("student_aptitudes"),
        Student.cv_url.label("student_cv"),
        Student.email.label("student_email")
    ).join(
        Student, Application.student_id == Student.id
    ).filter(
        Application.job_opening_id == job_opening_id
    ).order_by(
        Application.applied_at.desc()
    ).all()

def update_application_status(db: Session, application_id: str, status: str) -> Application | None:
    db_app = get_application_by_id(db, application_id)
    if db_app:
        db_app.status = status
        db.commit()
        db.refresh(db_app)
    return db_app
