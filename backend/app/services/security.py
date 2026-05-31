from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import decode_access_token

# Helper de seguridad para capturar el header Authorization: Bearer <TOKEN>
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependencia de seguridad que valida el token JWT de la cabecera.
    Retorna el diccionario con la información del usuario autenticado (id, email, role).
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso inválido, expirado o corrupto",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
