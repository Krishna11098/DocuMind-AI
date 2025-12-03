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
