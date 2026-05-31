from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Crear el motor de base de datos con SQLAlchemy conectado a Neon
engine = create_engine(settings.DATABASE_URL)

# Configurar la fábrica de sesiones locales
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para definir los modelos ORM
Base = declarative_base()

# Dependencia de FastAPI para inyectar la sesión en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
