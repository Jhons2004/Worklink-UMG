import os
import sys
import secrets

# Configurar path para importar desde backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.database import SessionLocal
from app.models.company import Company
from app.models.job import JobOpening
from app.services.auth_service import hash_password
from geoalchemy2.elements import WKTElement

def seed_db():
    db = SessionLocal()
    
    # Datos de empresas
    companies_data = [
        {
            "name": "TechGT Solutions",
            "email": "contacto@techgt.com",
            "website": "www.techgt.com",
            "lat": 14.6033,
            "lng": -90.5167, # Zona 10
            "jobs": [
                {"title": "Desarrollador Web Senior", "type": "Híbrido", "salary": 12000, "description": "Buscamos un dev full-stack para proyectos innovadores.", "location_name": "Guatemala (Zona 10)"},
                {"title": "Analista QA", "type": "Remoto", "salary": 8000, "description": "QA Automatizado.", "location_name": "Guatemala (Zona 10)"}
            ]
        },
        {
            "name": "Innova Devs",
            "email": "hr@innova.com",
            "website": "www.innova.com",
            "lat": 14.6333,
            "lng": -90.6000, # Mixco
            "jobs": [
                {"title": "Ingeniero de Datos", "type": "Tiempo Completo", "salary": 14000, "description": "Manejo de pipelines de datos y Big Data.", "location_name": "Mixco (San Cristóbal)"}
            ]
        },
        {
            "name": "CyberSec Global",
            "email": "jobs@cybersec.com",
            "website": "www.cybersec.com",
            "lat": 14.5264,
            "lng": -90.5896, # Villa Nueva
            "jobs": [
                {"title": "Especialista en Ciberseguridad", "type": "Medio Tiempo", "salary": 6500, "description": "Análisis de vulnerabilidades de red.", "location_name": "Villa Nueva"}
            ]
        }
    ]
    
    try:
        print("Poblando base de datos con empresas y vacantes georreferenciadas...")
        for c_data in companies_data:
            # Crear empresa si no existe
            company = db.query(Company).filter(Company.email == c_data["email"]).first()
            if not company:
                company = Company(
                    email=c_data["email"],
                    password=hash_password("Empresa123"),
                    name=c_data["name"],
                    website=c_data["website"],
                    location_geom=WKTElement(f"POINT({c_data['lng']} {c_data['lat']})", srid=4326)
                )
                db.add(company)
                db.commit()
                db.refresh(company)
                print(f"Empresa creada: {company.name}")
            else:
                print(f"Empresa ya existe: {company.name}")
                
            # Crear vacantes
            for j_data in c_data["jobs"]:
                job = db.query(JobOpening).filter(JobOpening.title == j_data["title"], JobOpening.company_id == company.id).first()
                if not job:
                    job = JobOpening(
                        company_id=company.id,
                        title=j_data["title"],
                        description=j_data["description"],
                        type=j_data["type"],
                        salary=j_data["salary"],
                        location_name=j_data["location_name"],
                        location_geom=WKTElement(f"POINT({c_data['lng']} {c_data['lat']})", srid=4326)
                    )
                    db.add(job)
                    db.commit()
                    print(f"  - Vacante creada: {job.title}")
                    
        print("Seed finalizado exitosamente!")
    except Exception as e:
        print(f"Error durante seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
