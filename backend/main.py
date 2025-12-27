


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
                    FileUploadResponse, DocumentStatus, PersonalDocStatus, OtpVerification,     SignupVerification, UserForgotPassword, UserResetPassword,
                    Department, DepartmentWithEmployees, CreateDepartmentRequest, TextDocumentCreate, ContentType)
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
from google import genai
from google.genai import types

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

# ✅ Add session middleware with better configuration
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
client = genai.Client(api_key=GENAI_API_KEY) if GENAI_API_KEY else None

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


# Initialize client for genai SDK


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

        # Send OTP email
        send_otp_email(user.email, otp)
        
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
            isAdmin=True,
            departments=[]  # Initialize empty departments list for admin
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

        # Send OTP email
        send_otp_email(user_data["email"], new_otp)
        
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

# ---------------------------- ADMIN ROUTES ----------------------------

@app.post("/add-employee/")
async def add_employee(request: Request, employee: EmployeeCreate):
    """Admin-only: Add employee to same company"""
    try:
        # Check if user is logged in
        session_data = require_admin(request)
        
        # Check if employee already exists
        emp_ref = db.collection("users").document(employee.email)
        if emp_ref.get().exists:
            raise HTTPException(status_code=400, detail="Employee already exists")

        # Generate and hash password
        random_pw = generate_password()
        hashed_pw = hashlib.sha256(random_pw.encode()).hexdigest()

        # Create employee record
        user_data = User(
            name=employee.name,
            email=employee.email,
            password=hashed_pw,
            department_name=employee.department_name,
            company_name=session_data["company_name"],
            isAdmin=False
        )
        emp_ref.set(user_data.dict())

        # # Send password to employee email
        # send_email(employee.email, random_pw)

        # Send password to employee email
        send_email(employee.email, random_pw)

        return {
            "success": True,
            "message": f"Employee {employee.name} added successfully",
            "password_sent": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------- DEPARTMENT MANAGEMENT ROUTES ----------------------------

@app.post("/create-department/")
async def create_department(request: Request, dept_request: CreateDepartmentRequest):
    """Admin creates a new department in their company"""
    try:
        session = require_admin(request)
        
        # Check if department already exists
        existing_depts = db.collection("departments").where(
            "company_name", "==", session["company_name"]
        ).where(
            "department_name", "==", dept_request.department_name
        ).get()
        
        if existing_depts:
            raise HTTPException(status_code=400, detail="Department already exists")
        
        # Create department
        department_id = str(uuid.uuid4())
        department = Department(
            department_id=department_id,
            department_name=dept_request.department_name,
            company_name=session["company_name"],
            created_by=session["email"],
            created_at=datetime.now(),
            description=dept_request.description
        )
        
        # Save to Firestore
        db.collection("departments").document(department_id).set(department.dict())
        
        # Update admin's user record with the new department
        admin_ref = db.collection("users").document(session["email"])
        admin_doc = admin_ref.get()
        
        if admin_doc.exists:
            admin_data = admin_doc.to_dict()
            departments = admin_data.get("departments", [])
            if dept_request.department_name not in departments:
                departments.append(dept_request.department_name)
                admin_ref.update({"departments": departments})
        
        return {
            "success": True,
            "message": f"Department '{dept_request.department_name}' created successfully",
            "department_id": department_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/departments/")
async def get_departments(request: Request):
    """Get all departments of admin's company with employee counts and details"""
    try:
        session = require_admin(request)
        
        # Get all departments for this company
        departments_query = db.collection("departments").where(
            "company_name", "==", session["company_name"]
        ).get()
        
        departments_list = []
        
        for dept_doc in departments_query:
            dept_data = dept_doc.to_dict()
            
            # Get all employees in this department
            employees_query = db.collection("users").where(
                "company_name", "==", session["company_name"]
            ).where(
                "department_name", "==", dept_data["department_name"]
            ).get()
            
            employees = []
            for emp_doc in employees_query:
                emp_data = emp_doc.to_dict()
                # Remove sensitive information
                emp_data.pop("password", None)
                employees.append({
                    "name": emp_data.get("name"),
                    "email": emp_data.get("email"),
                    "isAdmin": emp_data.get("isAdmin", False),
                    "department_name": emp_data.get("department_name")
                })
            
            dept_with_employees = DepartmentWithEmployees(
                department_id=dept_doc.id,
                department_name=dept_data.get("department_name"),
                description=dept_data.get("description"),
                employee_count=len(employees),
                employees=employees
            )
            
            departments_list.append(dept_with_employees.dict())
        
        return {
            "success": True,
            "company_name": session["company_name"],
            "total_departments": len(departments_list),
            "departments": departments_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------- DOCUMENT MANAGEMENT ROUTES ----------------------------

@app.post("/upload-file/")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Admin uploads a file to Cloudinary and creates document record"""
    try:
        session = require_admin(request)
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.file,
            resource_type="raw",  # Automatically detect file type
            folder="documents"
        )
        
        file_url = upload_result["secure_url"]
        document_id = str(uuid.uuid4())
        
        # Create document record
        document = Document(
            document_id=document_id,
            file_name=file.filename,
            file_url=file_url,
            content_type=ContentType.FILE,
            uploaded_by=session["email"],
            company_name=session["company_name"],
            timestamp=datetime.now()
        )
        
        # Save to Firestore
        doc_ref = db.collection("documents").document(document_id)
        doc_ref.set(document.dict())
        
        return FileUploadResponse(
            file_url=file_url,
            document_id=document_id,
            message="File uploaded successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-text/")
async def analyze_text(request: Request, text: str = Form(...)):
    """Analyze text input using Gemini AI"""
    try:
        session = require_admin(request)
        
        if not client:
            raise HTTPException(status_code=500, detail="Gemini API not configured")
        
        prompt = f"""
        Analyze this document text and provide:
        1. Summary (2-3 sentences)
        2. Document type
        3. Key findings (list)
        4. Urgency score (0-100)
        5. Importance score (0-100)
        6. Departments that should handle this (list)
        7. Confidence level (0-100)
        
        Document text:
        {text}
        
        Format as JSON with keys: summary, document_type, key_findings, urgency_score, importance_score, departments_responsible, confidence
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        # Parse the response to extract JSON
        analysis = parse_gemini_response(response.text)
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/create-text-document/")
async def create_text_document(
    request: Request, 
    title: str = Form(...),
    content: str = Form(...),
    analyze: bool = Form(True)
):
    """Create a text document and optionally analyze it"""
    try:
        session = require_admin(request)
        
        document_id = str(uuid.uuid4())
        
        # Create document record with text content
        document = Document(
            document_id=document_id,
            file_name=title,
            file_url=None,
            content_type=ContentType.TEXT,
            content=content,
            uploaded_by=session["email"],
            company_name=session["company_name"],
            timestamp=datetime.now(),
            processing_status=DocumentStatus.PENDING if analyze else DocumentStatus.ANALYZED
        )
        
        # Analyze if requested
        if analyze:
            if not client:
                raise HTTPException(status_code=500, detail="Gemini API not configured")
            
            prompt = f"""
            Analyze this document text and provide:
            1. Summary (2-3 sentences)
            2. Document type
            3. Key findings (list)
            4. Urgency score (0-100)
            5. Importance score (0-100)
            6. Departments that should handle this (list)
            7. Confidence level (0-100)
            
            Document text:
            {content}
            
            Format as JSON with keys: summary, document_type, key_findings, urgency_score, importance_score, departments_responsible, confidence
            """
            
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt
                )
                analysis = parse_gemini_response(response.text)
                
                # Update document with analysis results
                document.summary = analysis.get("summary", "")
                document.document_type = analysis.get("document_type", "Text Document")
                document.urgency_score = analysis.get("urgency_score", 50)
                document.importance_score = analysis.get("importance_score", 50)
                document.departments_responsible = analysis.get("departments_responsible", ["General"])
                document.confidence = analysis.get("confidence", 70)
                document.key_findings = analysis.get("key_findings", [])
                document.processing_status = DocumentStatus.ANALYZED
                document.analyzed_at = datetime.now()
            except Exception as e:
                document.error_message = str(e)
                document.processing_status = DocumentStatus.PENDING
        
        # Save to Firestore
        doc_ref = db.collection("documents").document(document_id)
        doc_ref.set(document.dict())
        
        return FileUploadResponse(
            file_url=None,
            document_id=document_id,
            message="Text document created successfully" + (" and analyzed" if analyze else "")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-document/")
async def analyze_document(request: Request, analyze_request: AnalyzeDocumentRequest):
    """Analyze document using Gemini AI"""
    try:
        session = require_admin(request)
        
        # Get document from Firestore
        doc_ref = db.collection("documents").document(analyze_request.document_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")
            
        document_data = doc.to_dict()
        
        # Check if document belongs to admin's company
        if document_data["company_name"] != session["company_name"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        # Update status to processing
        doc_ref.update({"processing_status": DocumentStatus.PROCESSING})
        
        # Check if it's a text document or file document
        content_type = document_data.get("content_type", ContentType.FILE)
        
        if content_type == ContentType.TEXT:
            # Analyze text content directly
            text_content = document_data.get("content", "")
            if not text_content:
                raise HTTPException(status_code=400, detail="No text content found")
                
            if not client:
                raise HTTPException(status_code=500, detail="Gemini API not configured")
            
            prompt = f"""
            Analyze this document text and provide:
            1. Summary (2-3 sentences)
            2. Document type
            3. Key findings (list)
            4. Urgency score (0-100)
            5. Importance score (0-100)
            6. Departments that should handle this (list)
            7. Confidence level (0-100)
            
            Document text:
            {text_content}
            
            Format as JSON with keys: summary, document_type, key_findings, urgency_score, importance_score, departments_responsible, confidence
            """
            
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            analysis_data = parse_gemini_response(response.text)
        else:
            # Analyze file document
            if not document_data.get("file_url"):
                raise HTTPException(status_code=400, detail="No file URL found")
                
            # Determine file type from filename
            file_name = document_data["file_name"].lower()
            file_type = "pdf" if file_name.endswith('.pdf') else "image"
            
            # Analyze with Gemini
            analysis_result = analyze_document_with_gemini(document_data["file_url"], file_type)
            
            if not analysis_result:
                doc_ref.update({
                    "processing_status": DocumentStatus.PENDING,
                    "error_message": "Failed to analyze document"
                })
                raise HTTPException(status_code=500, detail="Failed to analyze document")
                
            analysis_data = analysis_result
        
        # Update document with analysis results
        update_data = {
            "processing_status": DocumentStatus.ANALYZED,
            "summary": analysis_data.get("summary", ""),
            "document_type": analysis_data.get("document_type", "Unknown"),
            "urgency_score": analysis_data.get("urgency_score", 50),
            "importance_score": analysis_data.get("importance_score", 50),
            "departments_responsible": analysis_data.get("departments_responsible", []),
            "confidence": analysis_data.get("confidence", 70),
            "key_findings": analysis_data.get("key_findings", []),
            "analyzed_at": datetime.now()
        }
        
        doc_ref.update(update_data)
        
        return {"message": "Document analyzed successfully", "analysis": analysis_data}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Analyze document error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/assign-document/")
async def assign_document(request: Request, assign_request: AssignDocumentRequest):
    """Admin assigns document to departments"""
    try:
        session = require_admin(request)
        
        # Get document
        doc_ref = db.collection("documents").document(assign_request.document_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")
            
        document_data = doc.to_dict()
        
        # Check access
        if document_data["company_name"] != session["company_name"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        # Update document with assignments
        doc_ref.update({
            "departments_assigned": assign_request.departments,
            "processing_status": DocumentStatus.ASSIGNED,
            "assigned_at": datetime.now()
        })
        
        # Get all users in assigned departments
        users_query = db.collection("users").where("company_name", "==", session["company_name"])
        users = users_query.get()
        
        assigned_users = []
        for user_doc in users:
            user_data = user_doc.to_dict()
            if (not user_data.get("isAdmin", False) and 
                user_data.get("department_name") in assign_request.departments):
                
                # Add document to user's received docs
                user_docs = user_data.get("docs_received", [])
                if assign_request.document_id not in user_docs:
                    user_docs.append(assign_request.document_id)
                    
                    db.collection("users").document(user_data["email"]).update({
                        "docs_received": user_docs
                    })
                    
                    # Create personal document status record
                    personal_doc = PersonalDocumentStatus(
                        document_id=assign_request.document_id,
                        employee_email=user_data["email"],
                        personal_status=PersonalDocStatus.PENDING,
                        last_updated=datetime.now()
                    )
                    
                    db.collection("personal_doc_status").add(personal_doc.dict())
                    assigned_users.append(user_data["email"])
                    
        return {
            "message": "Document assigned successfully",
            "assigned_to": assigned_users,
            "departments": assign_request.departments
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-document-status/")
async def update_document_status(request: Request, status_request: UpdateDocumentStatusRequest):
    """Admin updates document status (complete/ignore/delete)"""
    try:
        session = require_admin(request)
        
        doc_ref = db.collection("documents").document(status_request.document_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")
            
        document_data = doc.to_dict()
        
        if document_data["company_name"] != session["company_name"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        update_data = {"processing_status": status_request.status}
        
        if status_request.status == DocumentStatus.COMPLETED:
            update_data["completed_at"] = datetime.now()
        elif status_request.status == DocumentStatus.DELETED:
            update_data["deleted_at"] = datetime.now()
            
        doc_ref.update(update_data)
        
        return {"message": f"Document status updated to {status_request.status}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents/")
async def get_documents(request: Request):
    """Get all documents for admin or user's assigned documents"""
    try:
        session = require_auth(request)
        
        if session.get("isAdmin", False):
            # Admin sees all company documents
            docs_query = db.collection("documents").where(
                "company_name", "==", session["company_name"]
            ).order_by("timestamp", direction="DESCENDING")
        else:
            # Employee sees only assigned documents
            user_doc = db.collection("users").document(session["email"]).get()
            user_data = user_doc.to_dict()
            doc_ids = user_data.get("docs_received", [])
            
            if not doc_ids:
                return {"documents": []}
                
            # Get documents by IDs
            documents = []
            for doc_id in doc_ids:
                doc = db.collection("documents").document(doc_id).get()
                if doc.exists:
                    doc_data = doc.to_dict()
                    
                    # Get personal status for this document
                    personal_status_query = db.collection("personal_doc_status").where(
                        "document_id", "==", doc_id
                    ).where("employee_email", "==", session["email"])
                    
                    personal_docs = list(personal_status_query.get())
                    if personal_docs:
                        personal_data = personal_docs[0].to_dict()
                        doc_data["personal_status"] = personal_data.get("personal_status")
                        doc_data["personal_comments"] = personal_data.get("comments")
                        
                    documents.append(doc_data)
                    
            return {"documents": documents}
            
        docs = docs_query.get()
        documents = [doc.to_dict() for doc in docs]
        
        return {"documents": documents}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-personal-doc-status/")
async def update_personal_doc_status(request: Request, status_request: UpdatePersonalDocStatusRequest):
    """Employee updates their personal document status and comments"""
    try:
        session = require_auth(request)
        
        # Check if user has access to this document
        user_doc = db.collection("users").document(session["email"]).get()
        user_data = user_doc.to_dict()
        
        if status_request.document_id not in user_data.get("docs_received", []):
            raise HTTPException(status_code=403, detail="Document not assigned to you")
            
        # Find and update personal document status
        personal_status_query = db.collection("personal_doc_status").where(
            "document_id", "==", status_request.document_id
        ).where("employee_email", "==", session["email"])
        
        personal_docs = list(personal_status_query.get())
        
        if personal_docs:
            # Update existing record
            personal_doc_ref = personal_docs[0].reference
            personal_doc_ref.update({
                "personal_status": status_request.status,
                "comments": status_request.comments,
                "last_updated": datetime.now()
            })
        else:
            # Create new record
            personal_doc = PersonalDocumentStatus(
                document_id=status_request.document_id,
                employee_email=session["email"],
                personal_status=status_request.status,
                comments=status_request.comments,
                last_updated=datetime.now()
            )
            db.collection("personal_doc_status").add(personal_doc.dict())
            
        return {"message": "Personal document status updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/employee-document-status/{document_id}")
async def get_employee_document_status(request: Request, document_id: str):
    """Admin views all employee statuses for a specific document"""
    try:
        session = require_admin(request)
        
        # Verify document belongs to admin's company
        doc_ref = db.collection("documents").document(document_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")
            
        document_data = doc.to_dict()
        if document_data["company_name"] != session["company_name"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        # Get all personal statuses for this document
        personal_status_query = db.collection("personal_doc_status").where(
            "document_id", "==", document_id
        )
        
        personal_statuses = personal_status_query.get()
        employee_statuses = []
        
        for status_doc in personal_statuses:
            status_data = status_doc.to_dict()
            
            # Get employee name
            employee_doc = db.collection("users").document(status_data["employee_email"]).get()
            if employee_doc.exists:
                employee_data = employee_doc.to_dict()
                status_data["employee_name"] = employee_data.get("name")
                status_data["department_name"] = employee_data.get("department_name")
                
            employee_statuses.append(status_data)
            
        return {
            "document_id": document_id,
            "document_name": document_data.get("file_name"),
            "employee_statuses": employee_statuses
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
