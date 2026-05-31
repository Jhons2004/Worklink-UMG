from sqlalchemy.orm import Session
from app.models.student import Student
from app.schemas.student import StudentCreate
from app.services.auth_service import hash_password
from geoalchemy2.elements import WKTElement

def get_student_by_email(db: Session, email: str) -> Student | None:
    return db.query(Student).filter(Student.email == email).first()

def get_student_by_carnet(db: Session, carnet: str) -> Student | None:
    return db.query(Student).filter(Student.carnet == carnet).first()

def create_student(db: Session, student_in: StudentCreate) -> Student:
    # Cifrar la contraseña
    hashed_pwd = hash_password(student_in.password)
    
    # Manejar las coordenadas geoespaciales
    geom = None
    if student_in.latitude is not None and student_in.longitude is not None:
        # En PostGIS, la longitud representa el eje X y la latitud representa el eje Y (POINT(long lat))
        geom = WKTElement(f"POINT({student_in.longitude} {student_in.latitude})", srid=4326)

    db_student = Student(
        name=student_in.name,
        email=student_in.email,
        carnet=student_in.carnet,
        career=student_in.career,
        password=hashed_pwd,
        phone=student_in.phone,
        biography=student_in.biography,
        location_geom=geom
    )
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student
