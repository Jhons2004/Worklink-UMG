from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import engine, Base
from app.models import *  # Importar todos los modelos para registrar sus metadatos
from app.config import settings
from app.controllers import auth_controller, profile_controller, job_controller, application_controller, admin_controller

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear todas las tablas definidas en los modelos ORM en PostgreSQL (Neon) al arrancar
    try:
        print("Intentando conectar con Neon...")
        from sqlalchemy import text
        with engine.connect() as connection:
            # Habilitar PostGIS automáticamente en Neon
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            # Asegurar columna career y aptitudes de estudiantes en Neon
            connection.execute(text("ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS career VARCHAR(100);"))
            connection.execute(text("ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS aptitudes TEXT;"))
            connection.commit()
            print("✔ Extensión PostGIS y columnas verificadas en Neon.")
            
        print("Creando tablas...")
        Base.metadata.create_all(bind=engine)
        
        # Crear directorio uploads si no existe
        os.makedirs(os.path.join(os.getcwd(), "uploads"), exist_ok=True)
        
        print("¡Tablas creadas/verificadas exitosamente en la base de datos de Neon!")
    except Exception as e:
        print(f"Error crítico al inicializar la base de datos: {e}")
    yield

app = FastAPI(
    title="WorkLink UMG API",
    description="Motor API con arquitectura multicapa y soporte geoespacial para WorkLink UMG",
    version="1.0.0",
    lifespan=lifespan
)

# Crear directorio uploads si no existe antes de montar
os.makedirs(os.path.join(os.getcwd(), "uploads"), exist_ok=True)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Permitir peticiones cruzadas (CORS) desde el frontend en Next.js (puerto 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes para facilitar el desarrollo local y en red
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los enrutadores de los controladores
app.include_router(auth_controller.router)
app.include_router(profile_controller.router)
app.include_router(job_controller.router)
app.include_router(application_controller.router)
app.include_router(admin_controller.router)

@app.get("/api")
def root():
    return {
        "status": "online",
        "project": "WorkLink UMG",
        "version": "1.0.0",
        "message": "Servidor FastAPI funcionando correctamente y conectado a PostgreSQL"
    }
