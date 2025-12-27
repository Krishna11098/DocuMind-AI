import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "true").lower() == "true"
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
SMTP_TIMEOUT = int(os.getenv("SMTP_TIMEOUT", "10"))

def send_email(receiver_email, password):
    """Send employee password email"""
    sender_email = EMAIL_SENDER
    sender_password = EMAIL_PASSWORD

    if not sender_email or not sender_password:
        raise RuntimeError("Email not configured: EMAIL_SENDER or EMAIL_PASSWORD missing")

    msg = EmailMessage()
    msg.set_content(
        f"Your account has been created.\nEmail: {receiver_email}\nPassword: {password}"
    )
    msg['Subject'] = 'Your Account Credentials'
    msg['From'] = sender_email
    msg['To'] = receiver_email

    if SMTP_USE_SSL:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)

def send_otp_email(receiver_email, otp):
    """Send signup OTP email"""
    sender_email = EMAIL_SENDER
    sender_password = EMAIL_PASSWORD

    if not sender_email or not sender_password:
        raise RuntimeError("Email not configured: EMAIL_SENDER or EMAIL_PASSWORD missing")

    msg = EmailMessage()
    msg.set_content(f"Your OTP is: {otp}\nThis OTP is valid for 5 minutes.")
    msg['Subject'] = 'Your OTP Code'
    msg['From'] = sender_email
    msg['To'] = receiver_email

    if SMTP_USE_SSL:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
