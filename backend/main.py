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