import sys
from pathlib import Path
import os

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import send_email

def test_apps_script_email():
    print("Enviando correo de prueba a través de Google Apps Script...")
    
    html_content = """
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#003057;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">WorkLink <span style="color:#ef4444;">UMG</span></h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#10b981;">¡Conexión de correo exitosa! ✅</h2>
        <p style="color:#64748b;">La API de Google Apps Script ha sido configurada y vinculada correctamente al backend de WorkLink UMG.</p>
        <p style="color:#64748b;">A partir de ahora, todas las notificaciones de postulación llegarán a las bandejas de entrada de los usuarios.</p>
      </div>
    </div>
    """
    
    success = send_email("jalvaradov12@miumg.edu.gt", "✅ Test API de Correo WorkLink UMG", html_content)
    
    if success:
        print("¡El correo de prueba ha sido enviado y el relay está funcionando!")
    else:
        print("Hubo un fallo al enviar el correo de prueba.")

if __name__ == "__main__":
    test_apps_script_email()
