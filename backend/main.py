# main.py - Complete corrected version
from fastapi import FastAPI, HTTPException, Request, Depends, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from firebase_admin_init import db
from models import (UserSignup, User, EmployeeCreate, UserLogin, 
                    DocumentCreate, Document, PersonalDocumentStatus,
                    AnalyzeDocumentRequest, AssignDocumentRequest, 
                    UpdateDocumentStatusRequest, UpdatePersonalDocStatusRequest,
                    FileUploadResponse, DocumentStatus, PersonalDocStatus, OtpVerification,     SignupVerification, UserForgotPassword, UserResetPassword)
import hashlib
import random
import string
import smtplib
from typing import List, Optional
from email.message import EmailMessage
from fastapi import UploadFile, File
import uuid
from datetime import datetime, timezone
import cloudinary
import cloudinary.uploader
import google.generativeai as genai
import requests
import io
from PIL import Image
import PyPDF2
import json
import re
import fitz  # PyMuPDF


import pdfplumber

import mimetypes

from dotenv import load_dotenv
import os

load_dotenv()
# Load configuration from environment
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "supersecretkey123")
SESSION_HTTPS_ONLY = os.getenv("SESSION_HTTPS_ONLY", "false").lower() == "true"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

# Cloudinary and Gemini API keys
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
GENAI_API_KEY = os.getenv("GENAI_API_KEY")

# Email configuration
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")





app = FastAPI()

def guess_mime(file_url):
    mime, _ = mimetypes.guess_type(file_url)
    return mime or "image/png"

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    same_site="lax",
    https_only=SESSION_HTTPS_ONLY,  # set True in production
    max_age=86400,  # 24 hours
    session_cookie="session"
)





# ✅ CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration - In production, move these to environment variables
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# Configure Gemini AI (Google Generative AI)
if GENAI_API_KEY:
    try:
        genai.configure(api_key=GENAI_API_KEY)
    except Exception:
        # Some genai versions expose configure differently; ignore if not applicable
        pass

# ---------------------------- UTIL FUNCTIONS ----------------------------
def generate_password(length=8):
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(length))

def send_email(receiver_email, password):
    """Send account credentials via SMTP using configured sender"""
    sender_email = EMAIL_SENDER or ""
    sender_password = EMAIL_PASSWORD or ""
    
    msg = EmailMessage()
    msg.set_content(f"Your account has been created.\nEmail: {receiver_email}\nPassword: {password}")
    msg['Subject'] = 'Your Account Credentials'
    msg['From'] = sender_email
    msg['To'] = receiver_email
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

def send_otp_email(receiver_email, otp):
    """Send OTP via Gmail SMTP"""
    sender_email = EMAIL_SENDER or ""
    sender_password = EMAIL_PASSWORD or ""
    
    msg = EmailMessage()
    msg.set_content(f"Your OTP is: {otp}\n\nThis OTP is valid for 5 minutes.")
    msg['Subject'] = 'Your OTP Code'
    msg['From'] = sender_email
    msg['To'] = receiver_email
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

def extract_text_from_pdf(file_url):
    """Extract text from PDF file"""
    try:
        response = requests.get(file_url)
        pdf_file = io.BytesIO(response.content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None

def parse_gemini_response(response_text: str) -> dict:
    """Parse Gemini response to extract JSON"""
    try:
        # Remove markdown code blocks
        clean_text = re.sub(r'```json\s*|\s*```', '', response_text).strip()
        
        # Find JSON pattern
        json_pattern = r'\{.*\}'
        match = re.search(json_pattern, clean_text, re.DOTALL)
        
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        else:
            return json.loads(clean_text)
    except json.JSONDecodeError:
        # Fallback parsing
        result = {
            "summary": "",
            "document_type": "Unknown",
            "key_findings": [],
            "urgency_score": 50,
            "importance_score": 50,
            "departments_responsible": ["General"],
            "confidence": 70
        }
        
        # Try to extract summary
        summary_match = re.search(r'"summary"\s*:\s*"([^"]+)"', response_text)
        if summary_match:
            result["summary"] = summary_match.group(1)
        else:
            result["summary"] = response_text[:200] + "..."
        
        return result
    
    from google import genai
from google.genai import types
import mimetypes
import fitz
import requests

client = genai.Client(api_key=GENAI_API_KEY) if GENAI_API_KEY else genai.Client()


def analyze_document_with_gemini(file_url, file_type):
    try:
        # ---------- PDF CASE ----------
        if file_type.lower() == "pdf":

            # First try normal text extraction
            text_content = extract_text_from_pdf(file_url)

            # If digital PDF (text exists)
            if text_content and len(text_content.strip()) > 30:
                prompt = f"""
                Analyze this document and return ONLY JSON with:
                summary, document_type, key_findings,
                urgency_score, importance_score,
                departments_responsible, confidence.

                Document text:
                {text_content[:5000]}
                """

                result = client.models.generate_content(
                    model="models/gemini-2.5-flash",
                    contents=prompt
                )
                return parse_gemini_response(result.text)

            # ---------- SCANNED PDF (NO TEXT) ----------
            response = requests.get(file_url)
            pdf_bytes = response.content

            # Load the PDF
            pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

            parts = []

            for i in range(len(pdf)):
                page = pdf.load_page(i)
                pix = page.get_pixmap(dpi=180)   # good DPI for OCR
                png_bytes = pix.tobytes("png")

                part = types.Part(
                    inline_data=types.Blob(
                        mime_type="image/png",
                        data=png_bytes
                    )
                )
                parts.append(part)

            prompt = """
            Perform OCR on this scanned PDF and analyze it.
            Return ONLY valid JSON with:
            summary, document_type, key_findings,
            urgency_score, importance_score,
            departments_responsible, confidence.
            """

            result = client.models.generate_content(
                model="models/gemini-2.5-flash-image",
                contents=[*parts, prompt]
            )

            return parse_gemini_response(result.text)

        # ---------- IMAGE CASE ----------
        else:
            response = requests.get(file_url)
            image_bytes = response.content

            # Find MIME type
            mime = response.headers.get("Content-Type")
            if not mime or mime == "application/octet-stream":
                mime = mimetypes.guess_type(file_url)[0] or "image/png"

            image_part = types.Part(
                inline_data=types.Blob(
                    mime_type=mime,
                    data=image_bytes
                )
            )

            prompt = """
            Analyze this image (OCR if needed).
            Return ONLY valid JSON with:
            summary, document_type, key_findings,
            urgency_score, importance_score,
            departments_responsible, confidence.
            """

            result = client.models.generate_content(
                model="models/gemini-2.5-flash-image",
                contents=[image_part, prompt]
            )

            return parse_gemini_response(result.text)

    except Exception as e:
        print("Error analyzing document with Gemini:", e)
        return None

def get_current_user(request: Request):
    """Get current user from session"""
    if "email" not in request.session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "email": request.session["email"],
        "isAdmin": request.session.get("isAdmin", False),
        "company_name": request.session.get("company_name")
    }

def require_admin(request: Request):
    """Check if user is admin"""
    user = get_current_user(request)
    if not user.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def require_auth(request: Request):
    """Check if user is authenticated"""
    return get_current_user(request)

# ---------------------------- AUTH ROUTES ----------------------------

@app.post("/signup/")
async def signup(request: Request, user: UserSignup):
    """Step 1: Start signup process by sending OTP"""
    try:
        # Check if user already exists
        doc_ref = db.collection("users").document(user.email)
        if doc_ref.get().exists:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        
        # # Send OTP email
        # send_otp_email(user.email, otp)

        # Send OTP email asynchronously
        send_otp_email_task.delay(user.email, otp)
        
        # Store OTP and user data in session for verification
        request.session["signup_otp"] = otp
        request.session["signup_user"] = {
            "name": user.name,
            "email": user.email,
            "password": user.password,  # Store plain password for now
            "company_name": user.company_name,
            "timestamp": datetime.now().isoformat()
        }
        
        # Set OTP expiry (5 minutes from now)
        request.session["signup_otp_expiry"] = datetime.now().timestamp() + 300
        request.session["signup_failed_attempts"] = 0
        
        return {
            "success": True,
            "message": "OTP sent to email. Please verify to complete signup.",
            "email": user.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start signup: {str(e)}")

@app.post("/verify-signup-otp/")
async def verify_signup_otp(request: Request, otp_data: OtpVerification):
    """Step 2: Verify OTP and create user account"""
    try:
        # Check if OTP exists in session
        if "signup_otp" not in request.session or "signup_user" not in request.session:
            raise HTTPException(status_code=400, detail="Signup session expired or not found")
        
        # Check OTP expiry
        expiry_time = request.session.get("signup_otp_expiry")
        if expiry_time and datetime.now().timestamp() > expiry_time:
            # Clear expired session
            request.session.clear()
            raise HTTPException(status_code=400, detail="OTP has expired. Please start signup again.")
        
        # Verify OTP
        stored_otp = request.session.get("signup_otp")
        if stored_otp != otp_data.otp:
            # Increment failed attempts counter
            failed_attempts = request.session.get("signup_failed_attempts", 0) + 1
            request.session["signup_failed_attempts"] = failed_attempts
            
            if failed_attempts >= 3:
                # Clear session after too many failed attempts
                request.session.clear()
                raise HTTPException(status_code=400, detail="Too many failed attempts. Please start signup again.")
            
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Get user data from session
        user_data = request.session.get("signup_user")
        if not user_data:
            raise HTTPException(status_code=400, detail="User data not found in session")
        
        # Verify email matches
        if user_data["email"] != otp_data.email:
            raise HTTPException(status_code=400, detail="Email mismatch")
        
        # Check if user was created in the meantime
        doc_ref = db.collection("users").document(otp_data.email)
        if doc_ref.get().exists:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        hashed_pw = hashlib.sha256(user_data["password"].encode()).hexdigest()
        
        # Create user in database
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=hashed_pw,
            department_name=None,
            company_name=user_data["company_name"],
            isAdmin=True
        )
        
        # Save to database
        doc_ref.set(user.dict())
        
        # Clear session data
        request.session.clear()
        
        # Create session for immediate login
        request.session["email"] = user.email
        request.session["isAdmin"] = True
        request.session["company_name"] = user.company_name
        request.session["name"] = user.name
        
        return {
            "success": True,
            "message": "Signup successful! Account created.",
            "user": {
                "name": user.name,
                "email": user.email,
                "company_name": user.company_name,
                "isAdmin": user.isAdmin
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to verify OTP: {str(e)}")

@app.post("/resend-signup-otp/")
async def resend_signup_otp(request: Request):
    """Resend OTP for signup verification"""
    try:
        # Check if user data exists in session
        if "signup_user" not in request.session:
            raise HTTPException(status_code=400, detail="No signup in progress")
        
        user_data = request.session.get("signup_user")
        
        # Generate new OTP
        new_otp = ''.join(random.choices(string.digits, k=6))
        
        # # Send OTP email
        # send_otp_email(user_data["email"], new_otp)

        # Send OTP email asynchronously
        send_otp_email_task.delay(user_data["email"], new_otp)
        
        # Update session with new OTP
        request.session["signup_otp"] = new_otp
        request.session["signup_otp_expiry"] = datetime.now().timestamp() + 300  # 5 minutes
        request.session["signup_failed_attempts"] = 0  # Reset failed attempts
        
        return {
            "success": True,
            "message": "New OTP sent to your email",
            "email": user_data["email"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Resend OTP error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to resend OTP: {str(e)}")

@app.post("/login/")
async def login(request: Request, user: UserLogin):
    """Login with email and password"""
    try:
        doc_ref = db.collection("users").document(user.email)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        user_data = doc.to_dict()
        hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()

        if user_data["password"] != hashed_pw:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Save user session
        request.session["email"] = user.email
        request.session["isAdmin"] = user_data["isAdmin"]
        request.session["company_name"] = user_data.get("company_name")
        request.session["name"] = user_data.get("name")
        request.session["department_name"] = user_data.get("department_name")

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "name": user_data.get("name"),
                "email": user_data.get("email"),
                "company_name": user_data.get("company_name"),
                "isAdmin": user_data.get("isAdmin", False),
                "department_name": user_data.get("department_name")
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logout/")
async def logout(request: Request):
    """Logout user"""
    request.session.clear()
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@app.get("/me/")
async def get_me(request: Request):
    """Return currently logged-in user info"""
    try:
        if "email" not in request.session:
            raise HTTPException(status_code=401, detail="Not authenticated")

        email = request.session["email"]
        doc = db.collection("users").document(email).get()
        if not doc.exists:
            # Clear invalid session
            request.session.clear()
            raise HTTPException(status_code=404, detail="User not found")

        user_data = doc.to_dict()
        # Remove password from response
        user_data.pop("password", None)
        
        return {
            "success": True,
            "message": "User data fetched",
            "user": user_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ---------------------------- FORGOT PASSWORD ROUTES ----------------------------

@app.post("/forgot-password/")
async def forgot_password(request: Request, email_data: UserForgotPassword):
    """Send OTP for password reset"""
    try:
        email = email_data.email
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Check if user exists
        doc_ref = db.collection("users").document(email)
        doc = doc_ref.get()
        if not doc.exists:
            # Don't reveal that user doesn't exist for security
            return {
                "success": True,
                "message": "If an account exists with this email, you will receive an OTP"
            }
        
        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        
        # Send OTP email
        send_otp_email(email, otp)
        
        # Store OTP in session
        request.session["reset_password_otp"] = otp
        request.session["reset_password_email"] = email
        request.session["reset_password_otp_expiry"] = datetime.now().timestamp() + 300
        
        return {
            "success": True,
            "message": "OTP sent to email"
        }
        
    except Exception as e:
        print(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset-password/")
async def reset_password(request: Request, reset_data: UserResetPassword):
    """Reset password with OTP verification"""
    try:
        email = reset_data.email
        otp = reset_data.otp
        new_password = reset_data.new_password
        
        if not all([email, otp, new_password]):
            raise HTTPException(status_code=400, detail="Email, OTP and new password are required")
        
        # Check OTP in session
        stored_otp = request.session.get("reset_password_otp")
        stored_email = request.session.get("reset_password_email")
        expiry_time = request.session.get("reset_password_otp_expiry")
        
        if not stored_otp or not stored_email:
            raise HTTPException(status_code=400, detail="OTP session expired")
        
        if datetime.now().timestamp() > expiry_time:
            request.session.pop("reset_password_otp", None)
            request.session.pop("reset_password_email", None)
            request.session.pop("reset_password_otp_expiry", None)
            raise HTTPException(status_code=400, detail="OTP has expired")
        
        if stored_otp != otp or stored_email != email:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Hash new password
        hashed_pw = hashlib.sha256(new_password.encode()).hexdigest()
        
        # Update password in database
        doc_ref = db.collection("users").document(email)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        doc_ref.update({"password": hashed_pw})
        
        # Clear session
        request.session.pop("reset_password_otp", None)
        request.session.pop("reset_password_email", None)
        request.session.pop("reset_password_otp_expiry", None)
        
        return {
            "success": True,
            "message": "Password reset successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


