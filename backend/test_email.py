import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_smtp():
    print("Testing SMTP connection...")
    smtp_host = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = "jalvaradov12@miumg.edu.gt"
    smtp_password = "hEyhM.*W_%"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Prueba de envío WorkLink UMG"
    msg["From"] = f"WorkLink UMG <{smtp_user}>"
    msg["To"] = smtp_user
    msg.attach(MIMEText("<h2>Prueba exitosa</h2><p>El correo funciona.</p>", "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.set_debuglevel(1)
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, smtp_user, msg.as_string())
        print("Test exitoso!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_smtp()
