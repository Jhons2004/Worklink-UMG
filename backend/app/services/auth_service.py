import json
import urllib.request
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from app.config import settings

def hash_password(password: str) -> str:
    # Generar sal y encriptar contraseña usando la librería bcrypt directamente
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), 
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict | None:
    try:
        decoded_token = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return decoded_token
    except jwt.PyJWTError:
        return None

def verify_google_token(id_token: str) -> dict | None:
    """
    Verifica el token de identidad de Google (ID Token) con el endpoint oficial de Google.
    """
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            
            if "error_description" in data:
                print(f"Error de Google OAuth: {data['error_description']}")
                return None
                
            return data
    except Exception as e:
        print(f"Excepción al verificar token de Google OAuth: {e}")
        return None
