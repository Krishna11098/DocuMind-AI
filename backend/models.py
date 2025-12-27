# models.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

# Enums for better type safety
class ContentType(str, Enum):
    FILE = "file"
    TEXT = "text"

class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    ASSIGNED = "assigned"
    COMPLETED = "completed"
    DELETED = "deleted"
    IGNORED = "ignored"

class PersonalDocStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    IGNORED = "ignored"

# User related models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department_name: str

class OtpVerification(BaseModel):
    email: EmailStr
    otp: str

class SignupVerification(BaseModel):
    email: EmailStr
    otp: str
    name: str
    password: str
    company_name: str

class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    department_name: Optional[str] = None
    company_name: str
    isAdmin: bool = False
    docs_received: Optional[List[str]] = []  # Array of document IDs
    departments: Optional[List[str]] = []  # For admins: list of department names in their company

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserForgotPassword(BaseModel):
    email: EmailStr
class UserResetPassword(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
# Document related models
class DocumentCreate(BaseModel):
    file_name: str
    file_url: str
    uploaded_by: EmailStr
    company_name: str
    timestamp: Optional[datetime] = None

class Document(BaseModel):
    document_id: Optional[str] = None
    file_name: str
    file_url: Optional[str] = None
    content_type: ContentType = ContentType.FILE
    content: Optional[str] = None
    uploaded_by: EmailStr
    company_name: str
    timestamp: datetime
    processing_status: DocumentStatus = DocumentStatus.PENDING
    summary: Optional[str] = None
    document_type: Optional[str] = None
    urgency_score: Optional[float] = None    # 0–100
    importance_score: Optional[float] = None # 0–100
    departments_responsible: Optional[List[str]] = []
    departments_assigned: Optional[List[str]] = []  # Departments assigned by admin
    confidence: Optional[float] = None
    key_findings: Optional[List[str]] = []
    analyzed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    assigned_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# Personal document tracking for employees
class PersonalDocumentStatus(BaseModel):
    document_id: str
    employee_email: EmailStr
    personal_status: PersonalDocStatus = PersonalDocStatus.PENDING
    comments: Optional[str] = None
    last_updated: Optional[datetime] = None

# Department model
class Department(BaseModel):
    department_id: Optional[str] = None
    department_name: str
    company_name: str
    created_by: EmailStr
    created_at: Optional[datetime] = None
    description: Optional[str] = None

class DepartmentWithEmployees(BaseModel):
    department_id: str
    department_name: str
    description: Optional[str] = None
    employee_count: int
    employees: List[Dict] = []  # List of employee details

class CreateDepartmentRequest(BaseModel):
    department_name: str
    description: Optional[str] = None

# Request models for API endpoints
class AnalyzeDocumentRequest(BaseModel):
    document_id: str

class AssignDocumentRequest(BaseModel):
    document_id: str
    departments: List[str]

class UpdateDocumentStatusRequest(BaseModel):
    document_id: str
    status: DocumentStatus

class UpdatePersonalDocStatusRequest(BaseModel):
    document_id: str
    status: PersonalDocStatus
    comments: Optional[str] = None

class TextDocumentCreate(BaseModel):
    title: str
    content: str
    analyze: bool = True

class FileUploadResponse(BaseModel):
    file_url: Optional[str] = None
    document_id: str
    message: str
