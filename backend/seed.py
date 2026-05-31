from app.database import SessionLocal, engine, Base
from app.schemas.student import StudentCreate
from app.schemas.company import CompanyCreate
from app.repositories import student_repository, company_repository
from app.models.student import Student
from app.models.company import Company
from sqlalchemy import text

def seed_database():
    print("Iniciando poblamiento (seed) de la base de datos Neon...")
    db = SessionLocal()
    try:
        # 1. Asegurar extensión PostGIS
        with engine.connect() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            connection.commit()
        
        # 2. Crear tablas
        Base.metadata.create_all(bind=engine)
        print("[OK] Tablas verificadas en Neon.")

        # 3. Insertar Estudiante de Prueba
        student_email = "carlos.mendoza@miumg.edu.gt"
        existing_student = student_repository.get_student_by_email(db, student_email)
        if existing_student:
            db.delete(existing_student)
            db.commit()
            print("[OK] Estudiante anterior eliminado para refrescar.")

        student_in = StudentCreate(
            name="Carlos Mendoza",
            email=student_email,
            carnet="0901-21-4321",
            career="Ingeniería en Sistemas de Información",
            password="password123",
            phone="5544-3322",
            biography="Estudiante de octavo ciclo apasionado por el desarrollo web y las bases de datos relacionales. Busco oportunidad como desarrollador junior.",
            latitude=14.6033,
            longitude=-90.5167
        )
        student = student_repository.create_student(db, student_in)
        print(f"[OK] Estudiante Carlos Mendoza creado en la base de datos (Clave: password123).")

        # 4. Insertar Empresa de Prueba
        company_email = "reclutamiento@multiti.com"
        existing_company = company_repository.get_company_by_email(db, company_email)
        if existing_company:
            db.delete(existing_company)
            db.commit()
            print("[OK] Empresa anterior eliminada para refrescar.")

        company_in = CompanyCreate(
            name="Corporación Multi-TI S.A.",
            email=company_email,
            password="password123",
            website="https://www.multiti.com",
            latitude=14.6133,
            longitude=-90.5367
        )
        company = company_repository.create_company(db, company_in)
        print(f"[OK] Empresa Corporacion Multi-TI S.A. creada en la base de datos (Clave: password123).")

        print("\n=== BASE DE DATOS SEMBRADA EXITOSAMENTE CON CREDENCIALES DE PRUEBA ===")

    except Exception as e:
        print(f"[ERROR] Error durante el seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
