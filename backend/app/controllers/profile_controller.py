from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import os
import shutil
import uuid
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.database import get_db
from app.services.security import get_current_user
from app.schemas.student import StudentResponse
from app.models.student import Student
from app.models.company import Company
from app.controllers.auth_controller import map_student_response, map_company_response

router = APIRouter(prefix="/api/profile", tags=["Perfiles"])

@router.get("", response_model=dict)
def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retorna el perfil del usuario autenticado (sea estudiante o empresa).
    """
    user_id = current_user["sub"]
    role = current_user["role"]
    
    if role == "estudiante":
        student = db.query(Student).filter(Student.id == user_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        return {"role": role, "profile": map_student_response(student)}
        
    elif role == "empresa":
        company = db.query(Company).filter(Company.id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        return {"role": role, "profile": map_company_response(company)}
        
    raise HTTPException(status_code=400, detail="Rol de usuario no válido")


@router.get("/students", response_model=list[dict])
def list_students(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna el listado de todos los estudiantes registrados (exclusivo para empresas).
    """
    if current_user["role"] != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación exclusiva para cuentas corporativas"
        )
        
    students = db.query(Student).all()
    return [map_student_response(s) for s in students]


@router.put("/student", response_model=StudentResponse)
def update_student_profile(
    profile_data: dict, 
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de perfil del estudiante autenticado, incluyendo georreferenciación.
    """
    if current_user["role"] != "estudiante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta operación es exclusiva para cuentas de estudiante"
        )
        
    user_id = current_user["sub"]
    student = db.query(Student).filter(Student.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no registrado")
        
    # Actualizar campos de texto
    if "name" in profile_data:
        student.name = profile_data["name"]
    if "phone" in profile_data:
        student.phone = profile_data["phone"]
    if "biography" in profile_data:
        student.biography = profile_data["biography"]
    if "aptitudes" in profile_data:
        student.aptitudes = profile_data["aptitudes"]
    if "cvName" in profile_data:
        student.cv_url = profile_data["cvName"]
        
    # Actualizar coordenadas geográficas residenciales
    if "latitude" in profile_data and "longitude" in profile_data:
        lat = profile_data["latitude"]
        lng = profile_data["longitude"]
        if lat is not None and lng is not None:
            student.location_geom = WKTElement(f"POINT({lng} {lat})", srid=4326)
            
    db.commit()
    db.refresh(student)
    return map_student_response(student)

@router.post("/student/upload-cv")
async def upload_student_cv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "estudiante":
        raise HTTPException(status_code=403, detail="Exclusivo para estudiantes")
        
    user_id = current_user["sub"]
    student = db.query(Student).filter(Student.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    # Crear directorio si no existe
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generar nombre único para evitar colisiones
    file_ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{user_id}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    student.cv_url = f"/uploads/{safe_filename}"
    db.commit()
    
    return {"message": "CV subido exitosamente", "cv_url": student.cv_url}


@router.put("/company", response_model=dict)
def update_company_profile(
    profile_data: dict, 
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de perfil de la empresa autenticada, incluyendo georreferenciación.
    """
    if current_user["role"] != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta operación es exclusiva para cuentas de empresa"
        )
        
    user_id = current_user["sub"]
    company = db.query(Company).filter(Company.id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no registrada")
        
    # Actualizar campos de texto
    if "name" in profile_data:
        company.name = profile_data["name"]
    if "website" in profile_data:
        company.website = profile_data["website"]
        
    # Actualizar coordenadas geográficas
    if "latitude" in profile_data and "longitude" in profile_data:
        lat = profile_data["latitude"]
        lng = profile_data["longitude"]
        if lat is not None and lng is not None:
            company.location_geom = WKTElement(f"POINT({lng} {lat})", srid=4326)
            
    db.commit()
    db.refresh(company)
    return map_company_response(company)
