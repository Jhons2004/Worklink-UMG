import requests
from app.config import settings

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_CXxwXBa_LJNZVfBmm_ZL9k52vF33a3dE7DTOCZEdmyKKV8y8jClLhwlj_f5576EZ7g/exec"

def send_email(to: str, subject: str, html_body: str) -> bool:
    """
    Envía un correo HTML usando la API de Google Apps Script.
    """
    try:
        payload = {
            "to": to,
            "subject": subject,
            "htmlBody": html_body
        }
        response = requests.post(APPS_SCRIPT_URL, json=payload)
        data = response.json()
        
        if data.get("success"):
            print(f"[OK] Email enviado exitosamente a {to}")
            return True
        else:
            print(f"[ERROR] Error devuelto por Apps Script al enviar a {to}: {data.get('error')}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Excepcion al enviar email a {to}: {e}")
        return False


def send_application_received_student(student_name: str, student_email: str, job_title: str, company_name: str):
    """Email al estudiante al postularse."""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#003057;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">WorkLink <span style="color:#ef4444;">UMG</span></h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px;">UNIVERSIDAD MARIANO GÁLVEZ</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#003057;">¡Postulación Enviada Exitosamente! 🚀</h2>
        <p style="color:#64748b;">Hola <strong>{student_name}</strong>,</p>
        <p style="color:#64748b;">Tu postulación a la vacante <strong style="color:#003057;">{job_title}</strong> en <strong>{company_name}</strong> ha sido registrada en nuestra plataforma.</p>
        <div style="background:#f8fafc;border-left:4px solid #003057;padding:16px;border-radius:4px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#003057;font-weight:bold;">📋 Detalles de tu postulación:</p>
          <p style="margin:8px 0 0;color:#475569;">• Vacante: {job_title}</p>
          <p style="margin:4px 0 0;color:#475569;">• Empresa: {company_name}</p>
          <p style="margin:4px 0 0;color:#475569;">• Estado: <span style="color:#f59e0b;font-weight:bold;">En Revisión</span></p>
        </div>
        <p style="color:#64748b;">La empresa revisará tu CV y te notificaremos cualquier actualización de estado.</p>
        <a href="http://localhost:3000/dashboard" style="display:inline-block;background:#ef4444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Ver mis Postulaciones</a>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">© 2025 WorkLink UMG · Universidad Mariano Gálvez de Guatemala</p>
      </div>
    </div>
    """
    send_email(student_email, f"✅ Postulación registrada: {job_title} en {company_name}", html)


def send_new_applicant_company(company_email: str, company_name: str, student_name: str, student_career: str, job_title: str):
    """Email a la empresa cuando llega un nuevo postulante."""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#003057;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">WorkLink <span style="color:#ef4444;">UMG</span></h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px;">PORTAL EMPRESARIAL</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#003057;">¡Nuevo Aspirante Recibido! 👥</h2>
        <p style="color:#64748b;">Hola <strong>{company_name}</strong>,</p>
        <p style="color:#64748b;">Un estudiante de la Universidad Mariano Gálvez se ha postulado a tu vacante.</p>
        <div style="background:#f8fafc;border-left:4px solid #ef4444;padding:16px;border-radius:4px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#003057;font-weight:bold;">📄 Detalles del Aspirante:</p>
          <p style="margin:8px 0 0;color:#475569;">• Nombre: <strong>{student_name}</strong></p>
          <p style="margin:4px 0 0;color:#475569;">• Carrera: {student_career or 'No especificada'}</p>
          <p style="margin:4px 0 0;color:#475569;">• Plaza: {job_title}</p>
        </div>
        <a href="http://localhost:3000/dashboard-empresa" style="display:inline-block;background:#003057;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Ver Postulantes en el Panel</a>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">© 2025 WorkLink UMG · Universidad Mariano Gálvez de Guatemala</p>
      </div>
    </div>
    """
    send_email(company_email, f"👥 Nuevo postulante a: {job_title}", html)


def send_application_status_update(student_name: str, student_email: str, job_title: str, company_name: str, new_status: str):
    """Email al estudiante cuando cambia el estado de su postulación."""
    status_labels = {
        "ACEPTADA": ("✅ ¡Felicidades! Tu postulación fue ACEPTADA", "#10b981", "La empresa ha revisado tu perfil y ha decidido aceptar tu candidatura. Pronto recibirás más detalles de contacto."),
        "RECHAZADA": ("❌ Actualización de tu postulación", "#ef4444", "Lamentablemente, la empresa ha decidido continuar el proceso con otros candidatos. ¡No te desanimes, hay más oportunidades!"),
        "EN_REVISION": ("⏳ Tu postulación está En Revisión", "#f59e0b", "La empresa está revisando actualmente tu CV y perfil profesional."),
    }
    label, color, message = status_labels.get(new_status, ("📩 Actualización de postulación", "#003057", "Tu postulación ha sido actualizada."))
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#003057;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">WorkLink <span style="color:#ef4444;">UMG</span></h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:{color};">{label}</h2>
        <p style="color:#64748b;">Hola <strong>{student_name}</strong>,</p>
        <p style="color:#64748b;">{message}</p>
        <div style="background:#f8fafc;border-left:4px solid {color};padding:16px;border-radius:4px;margin:20px 0;">
          <p style="margin:0;color:#475569;">• Vacante: <strong>{job_title}</strong></p>
          <p style="margin:4px 0 0;color:#475569;">• Empresa: {company_name}</p>
          <p style="margin:4px 0 0;color:#475569;">• Nuevo estado: <strong style="color:{color};">{new_status}</strong></p>
        </div>
        <a href="http://localhost:3000/dashboard" style="display:inline-block;background:#003057;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Ver mis Postulaciones</a>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">© 2025 WorkLink UMG</p>
      </div>
    </div>
    """
    send_email(student_email, label, html)
