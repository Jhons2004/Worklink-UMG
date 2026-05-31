from app.database import SessionLocal, engine, Base
from app.schemas.student import StudentCreate
from app.repositories import student_repository
from app.services import auth_service
from app.models.student import Student
from sqlalchemy import text

def test_flow():
    print("Iniciando pruebas de integracion de base de datos y autenticacion...")
    
    # 1. Crear sesion de base de datos
    db = SessionLocal()
    try:
        # Asegurarse de habilitar PostGIS en Neon
        with engine.connect() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            connection.commit()
        print("[OK] Extension PostGIS verificada/creada en Neon DB.")

        # Asegurarse de que las tablas existan
        Base.metadata.create_all(bind=engine)
        print("[OK] Tablas e indices espaciales creados en Neon DB.")

        # 2. Datos de prueba de estudiante
        test_email = "carlos.mendoza.test@miumg.edu.gt"
        
        # Limpiar si ya existe de pruebas anteriores
        existing = student_repository.get_student_by_email(db, test_email)
        if existing:
            db.delete(existing)
            db.commit()
            print("[OK] Registro de prueba previo eliminado.")

        student_in = StudentCreate(
            name="Carlos Mendoza Test",
            email=test_email,
            carnet="0901-21-4321-TEST",
            password="password123",
            phone="12345678",
            biography="Estudiante de prueba de sistemas",
            latitude=14.6033,
            longitude=-90.5167
        )

        # 3. Registrar estudiante
        student = student_repository.create_student(db, student_in)
        print(f"[OK] Estudiante registrado en base de datos. ID: {student.id}")
        assert student.name == "Carlos Mendoza Test"
        assert student.email == test_email
        assert student.carnet == "0901-21-4321-TEST"

        # 4. Probar verificacion de contrasena
        student_db = student_repository.get_student_by_email(db, test_email)
        assert auth_service.verify_password("password123", student_db.password) == True
        assert auth_service.verify_password("wrongpassword", student_db.password) == False
        print("[OK] Encriptacion de contrasena (bcrypt) y verificacion correctas.")

        # 5. Probar generacion de Token JWT
        token_data = {"sub": student_db.id, "email": student_db.email, "role": "estudiante"}
        token = auth_service.create_access_token(data=token_data)
        print(f"[OK] Token JWT emitido con exito.")

        # 6. Desencriptar Token JWT
        decoded = auth_service.decode_access_token(token)
        assert decoded is not None
        assert decoded["sub"] == student_db.id
        assert decoded["role"] == "estudiante"
        print("[OK] Validacion y desencripcion del token JWT correctas.")

        # Limpiar base de datos al finalizar
        db.delete(student_db)
        db.commit()
        print("[OK] Base de datos limpia de registros de prueba.")
        print("\n=== TODAS LAS PRUEBAS PASARON EXITOSAMENTE ===")

    except Exception as e:
        print(f"[ERROR] Error durante las pruebas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_flow()
