import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import requests

# Load variables from .env
load_dotenv()

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "true").lower() == "true"
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
SMTP_TIMEOUT = int(os.getenv("SMTP_TIMEOUT", "10"))
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM = os.getenv("RESEND_FROM")
RESEND_API_URL = "https://api.resend.com/emails"

def _send_via_resend(receiver_email: str, subject: str, html_body: str, text_body: str):
    if not RESEND_API_KEY or not RESEND_FROM:
        raise RuntimeError("Resend not configured: RESEND_API_KEY or RESEND_FROM missing")

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": RESEND_FROM,
        "to": receiver_email,
        "subject": subject,
        "html": html_body,
        "text": text_body,
    }
    resp = requests.post(RESEND_API_URL, headers=headers, json=payload, timeout=10)
    if resp.status_code >= 300:
        raise RuntimeError(f"Resend error {resp.status_code}: {resp.text}")

def _send_via_smtp(receiver_email: str, subject: str, text_body: str):
    sender_email = EMAIL_SENDER
    sender_password = EMAIL_PASSWORD

    if not sender_email or not sender_password:
        raise RuntimeError("Email not configured: EMAIL_SENDER or EMAIL_PASSWORD missing")

    msg = EmailMessage()
    msg.set_content(text_body)
    msg['Subject'] = subject
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

def send_email(receiver_email, password):
    """Send employee password email via Resend if configured, otherwise SMTP."""
    subject = 'Your Account Credentials'
    text_body = f"Your account has been created.\nEmail: {receiver_email}\nPassword: {password}"
    html_body = f"<p>Your account has been created.</p><p>Email: {receiver_email}<br>Password: {password}</p>"

    if RESEND_API_KEY and RESEND_FROM:
        _send_via_resend(receiver_email, subject, html_body, text_body)
    else:
        _send_via_smtp(receiver_email, subject, text_body)

def send_otp_email(receiver_email, otp):
    """Send signup OTP email via Resend if configured, otherwise SMTP."""
    subject = 'Your OTP Code'
    text_body = f"Your OTP is: {otp}\nThis OTP is valid for 5 minutes."
    html_body = f"<p>Your OTP is: <strong>{otp}</strong></p><p>This OTP is valid for 5 minutes.</p>"

    if RESEND_API_KEY and RESEND_FROM:
        _send_via_resend(receiver_email, subject, html_body, text_body)
    else:
        _send_via_smtp(receiver_email, subject, text_body)
