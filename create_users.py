import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000/api/auth"

student_data = {
    "name": "Juan Perez",
    "email": "jperez@miumg.edu.gt",
    "carnet": "1234-56-7890",
    "password": "password123",
    "phone": "12345678",
    "biography": "Estudiante de ingeniería en sistemas, buscando mi primera experiencia laboral."
}

company_data = {
    "name": "Tech Corp GT",
    "email": "rrhh@techcorpgt.com",
    "password": "password123",
    "website": "www.techcorpgt.com"
}

def post_json(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return response.read().decode('utf-8'), response.status
    except urllib.error.HTTPError as e:
        return e.read().decode('utf-8'), e.code

print("Registrando estudiante...")
resp_text, status = post_json(f"{BASE_URL}/register-student", student_data)
if status == 201:
    print("Estudiante registrado exitosamente:", resp_text)
else:
    print("Error registrando estudiante:", status, resp_text)

print("\nRegistrando empresa...")
resp_text_c, status_c = post_json(f"{BASE_URL}/register-company", company_data)
if status_c == 201:
    print("Empresa registrada exitosamente:", resp_text_c)
else:
    print("Error registrando empresa:", status_c, resp_text_c)
