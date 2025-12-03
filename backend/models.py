# models.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

# Enums for better type safety
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