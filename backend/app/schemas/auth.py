from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    id_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  # estudiante, empresa, admin
    id: str    # ID del usuario autenticado
    name: str  # Nombre del usuario autenticado
