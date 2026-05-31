from sqlalchemy.orm import Session
from app.models.company import Company
from app.schemas.company import CompanyCreate
from app.services.auth_service import hash_password
from geoalchemy2.elements import WKTElement

def get_company_by_email(db: Session, email: str) -> Company | None:
    return db.query(Company).filter(Company.email == email).first()

def create_company(db: Session, company_in: CompanyCreate) -> Company:
    # Cifrar la contraseña
    hashed_pwd = hash_password(company_in.password)
    
    # Manejar las coordenadas geoespaciales
    geom = None
    if company_in.latitude is not None and company_in.longitude is not None:
        # POINT(long lat)
        geom = WKTElement(f"POINT({company_in.longitude} {company_in.latitude})", srid=4326)

    db_company = Company(
        name=company_in.name,
        email=company_in.email,
        password=hashed_pwd,
        website=company_in.website,
        location_geom=geom
    )
    
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company
