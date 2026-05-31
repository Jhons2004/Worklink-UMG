import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape

from app.database import get_db
from app.schemas.auth import LoginRequest, GoogleLoginRequest, TokenResponse
from app.schemas.student import StudentCreate, StudentResponse
from app.schemas.company import CompanyCreate, CompanyResponse
from app.repositories import student_repository, company_repository
from app.services import auth_service
from app.models.student import Student
from app.models.company import Company

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

# Funciones auxiliares de mapeo para evitar errores de serialización geoespacial de Pydantic
def map_student_response(student: Student) -> dict:
    lat = None
    lng = None
    if student.location_geom is not None:
        point = to_shape(student.location_geom)
        lat = point.y
        lng = point.x
        
    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "carnet": student.carnet,
        "career": student.career,
        "phone": student.phone,
        "biography": student.biography,
        "aptitudes": student.aptitudes,
        "cv_url": student.cv_url,
        "latitude": lat,
        "longitude": lng,
        "created_at": student.created_at,
        "updated_at": student.updated_at
    }

def map_company_response(company: Company) -> dict:
    lat = None
    lng = None
    if company.location_geom is not None:
        point = to_shape(company.location_geom)
        lat = point.y
        lng = point.x
        
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "website": company.website,
        "latitude": lat,
        "longitude": lng,
        "created_at": company.created_at,
        "updated_at": company.updated_at
    }

@router.post("/register-student", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def register_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    # 1. Validar dominio de correo institucional estricto (RF-101)
    if not student_in.email.endswith("@miumg.edu.gt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El registro de estudiantes exige un correo institucional @miumg.edu.gt"
        )
        
    # 2. Verificar duplicados de correo
    if student_repository.get_student_by_email(db, student_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado"
        )
        
    # 3. Verificar duplicados de carnet
    if student_repository.get_student_by_carnet(db, student_in.carnet):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carnet universitario ya está registrado"
        )
        
    student = student_repository.create_student(db, student_in)
    return map_student_response(student)


@router.post("/register-company", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def register_company(company_in: CompanyCreate, db: Session = Depends(get_db)):
    # 1. Verificar duplicados de correo
    if company_repository.get_company_by_email(db, company_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado para otra empresa"
        )
        
    company = company_repository.create_company(db, company_in)
    return map_company_response(company)


@router.post("/login-student", response_model=TokenResponse)
def login_student(login_data: LoginRequest, db: Session = Depends(get_db)):
    student = student_repository.get_student_by_email(db, login_data.email)
    if not student or not auth_service.verify_password(login_data.password, student.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas de estudiante"
        )
        
    # Generar Token JWT
    token_data = {"sub": student.id, "email": student.email, "role": "estudiante"}
    token = auth_service.create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "estudiante",
        "id": student.id,
        "name": student.name
    }


@router.post("/login-company", response_model=TokenResponse)
def login_company(login_data: LoginRequest, db: Session = Depends(get_db)):
    company = company_repository.get_company_by_email(db, login_data.email)
    if not company or not auth_service.verify_password(login_data.password, company.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas de empresa"
        )
        
    # Generar Token JWT
    token_data = {"sub": company.id, "email": company.email, "role": "empresa"}
    token = auth_service.create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "empresa",
        "id": company.id,
        "name": company.name
    }


@router.post("/google-login-student", response_model=TokenResponse)
def google_login_student(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    # 1. Verificar el token directamente con Google OAuth
    google_data = auth_service.verify_google_token(request.id_token)
    if not google_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Google inválido, expirado o corrupto"
        )
        
    student_email = google_data.get("email")
    if not student_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google no proveyó una dirección de correo válida"
        )
        
    # 2. Validación estricta de dominio institucional (RF-101)
    hd = google_data.get("hd")
    if hd != "miumg.edu.gt" and not student_email.endswith("@miumg.edu.gt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El acceso exige un correo institucional con el dominio @miumg.edu.gt"
        )
        
    # 3. Buscar si el estudiante ya está registrado
    student = student_repository.get_student_by_email(db, student_email)
    
    # 4. Si es nuevo, auto-registro rápido en caliente
    if not student:
        alias = student_email.split("@")[0]
        carnet_prov = f"UMG-{alias}"
        
        # Evitar colisión de carnet si existiese el alias
        counter = 1
        while student_repository.get_student_by_carnet(db, carnet_prov):
            carnet_prov = f"UMG-{alias}-{counter}"
            counter += 1
            
        student_in = StudentCreate(
            name=google_data.get("name", "Estudiante Google"),
            email=student_email,
            carnet=carnet_prov,
            password=secrets.token_urlsafe(16),  # Contraseña segura e inaccesible
            phone=None,
            biography="Perfil auto-creado mediante autenticación de Google OAuth 2.0"
        )
        student = student_repository.create_student(db, student_in)
        
    # 5. Generar JWT del sistema
    token_data = {"sub": student.id, "email": student.email, "role": "estudiante"}
    token = auth_service.create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "estudiante",
        "id": student.id,
        "name": student.name
    }

@router.post("/google-login-company", response_model=TokenResponse)
def google_login_company(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    # 1. Verificar el token directamente con Google OAuth
    google_data = auth_service.verify_google_token(request.id_token)
    if not google_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Google inválido, expirado o corrupto"
        )
        
    company_email = google_data.get("email")
    if not company_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google no proveyó una dirección de correo válida"
        )
        
    # 2. Buscar si la empresa ya está registrada
    company = company_repository.get_company_by_email(db, company_email)
    
    # 3. Si es nueva, auto-registro rápido en caliente
    if not company:
        company_in = CompanyCreate(
            name=google_data.get("name", "Empresa Google"),
            email=company_email,
            password=secrets.token_urlsafe(16),  # Contraseña segura e inaccesible
            website=None
        )
        company = company_repository.create_company(db, company_in)
        
    # 4. Generar JWT del sistema
    token_data = {"sub": company.id, "email": company.email, "role": "empresa"}
    token = auth_service.create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "empresa",
        "id": company.id,
        "name": company.name
    }
