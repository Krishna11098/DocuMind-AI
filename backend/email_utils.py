import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_email(receiver_email, password):
    """Send employee password email"""
    sender_email = EMAIL_SENDER
    sender_password = EMAIL_PASSWORD
    
    msg = EmailMessage()
    msg.set_content(
        f"Your account has been created.\nEmail: {receiver_email}\nPassword: {password}"
    )
    msg['Subject'] = 'Your Account Credentials'
    msg['From'] = sender_email
    msg['To'] = receiver_email
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

def send_otp_email(receiver_email, otp):
    """Send signup OTP email"""
    sender_email = EMAIL_SENDER
    sender_password = EMAIL_PASSWORD
    
    msg = EmailMessage()
    msg.set_content(f"Your OTP is: {otp}\nThis OTP is valid for 5 minutes.")
    msg['Subject'] = 'Your OTP Code'
    msg['From'] = sender_email
    msg['To'] = receiver_email
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)
