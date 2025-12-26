# DocuMind AI - Backend API Documentation

## Authentication Endpoints

### 1. Sign Up
**POST** `/signup/`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "company_name": "Acme Corp"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email. Please verify to complete signup.",
  "email": "john@example.com"
}
```

### 2. Verify Signup OTP
**POST** `/verify-signup-otp/`
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Signup successful! Account created.",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "company_name": "Acme Corp",
    "isAdmin": true
  }
}
```

### 3. Resend Signup OTP
**POST** `/resend-signup-otp/`
**Response:**
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "email": "john@example.com"
}
```

### 4. Login
**POST** `/login/`
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "company_name": "Acme Corp",
    "isAdmin": true,
    "departments": ["HR", "Finance"]
  }
}
```

### 5. Logout
**POST** `/logout/`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Get Current User
**GET** `/me/`
**Response:**
```json
{
  "success": true,
  "message": "User data fetched",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "company_name": "Acme Corp",
    "isAdmin": true,
    "departments": ["HR", "Finance"]
  }
}
```

---

## Password Reset Endpoints

### 7. Forgot Password
**POST** `/forgot-password/`
```json
{
  "email": "john@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive an OTP"
}
```

### 8. Reset Password
**POST** `/reset-password/`
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "new_password": "newpass456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Admin Management Endpoints

### 9. Add Employee
**POST** `/add-employee/` (Admin only)
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "department_name": "HR"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Employee Jane Smith added successfully",
  "password_sent": true
}
```

---

## Department Management Endpoints

### 10. Create Department
**POST** `/create-department/` (Admin only)
```json
{
  "department_name": "Human Resources",
  "description": "Handles all HR operations"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Department 'Human Resources' created successfully",
  "department_id": "uuid-string"
}
```

### 11. Get All Departments
**GET** `/departments/` (Admin only)

**Response:**
```json
{
  "success": true,
  "company_name": "Acme Corp",
  "total_departments": 3,
  "departments": [
    {
      "department_id": "dept-uuid-1",
      "department_name": "Human Resources",
      "description": "Handles all HR operations",
      "employee_count": 2,
      "employees": [
        {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "isAdmin": false,
          "department_name": "Human Resources"
        },
        {
          "name": "Bob Johnson",
          "email": "bob@example.com",
          "isAdmin": false,
          "department_name": "Human Resources"
        }
      ]
    },
    {
      "department_id": "dept-uuid-2",
      "department_name": "Finance",
      "description": "Financial management",
      "employee_count": 1,
      "employees": [
        {
          "name": "Alice Brown",
          "email": "alice@example.com",
          "isAdmin": false,
          "department_name": "Finance"
        }
      ]
    }
  ]
}
```

---

## Document Management Endpoints

### 12. Upload File
**POST** `/upload-file/` (Admin only)
- Form data with file upload
- Files are stored on Cloudinary

**Response:**
```json
{
  "file_url": "https://cloudinary.com/...",
  "document_id": "doc-uuid",
  "message": "File uploaded successfully"
}
```

### 13. Analyze Document
**POST** `/analyze-document/` (Admin only)
```json
{
  "document_id": "doc-uuid"
}
```
**Response:**
```json
{
  "message": "Document analyzed successfully",
  "analysis": {
    "summary": "This document is a resume...",
    "document_type": "Resume",
    "key_findings": ["..."],
    "urgency_score": 75,
    "importance_score": 85,
    "departments_responsible": ["HR", "Finance"],
    "confidence": 95
  }
}
```

### 14. Assign Document
**POST** `/assign-document/` (Admin only)
```json
{
  "document_id": "doc-uuid",
  "departments": ["HR", "Finance"]
}
```
**Response:**
```json
{
  "message": "Document assigned successfully",
  "assigned_to": ["jane@example.com", "alice@example.com"],
  "departments": ["HR", "Finance"]
}
```

### 15. Update Document Status
**POST** `/update-document-status/` (Admin only)
```json
{
  "document_id": "doc-uuid",
  "status": "completed"
}
```
**Response:**
```json
{
  "message": "Document status updated to completed"
}
```

### 16. Get Documents
**GET** `/documents/`

**Admin Response (all company documents):**
```json
{
  "documents": [
    {
      "document_id": "doc-uuid",
      "file_name": "resume.pdf",
      "file_url": "https://...",
      "uploaded_by": "john@example.com",
      "company_name": "Acme Corp",
      "processing_status": "analyzed",
      "summary": "...",
      "document_type": "Resume",
      ...
    }
  ]
}
```

**Employee Response (assigned documents):**
```json
{
  "documents": [
    {
      "document_id": "doc-uuid",
      "file_name": "resume.pdf",
      "file_url": "https://...",
      "personal_status": "pending",
      "personal_comments": "Need to review",
      ...
    }
  ]
}
```

### 17. Analyze Text
**POST** `/analyze-text/` (Admin only)
```json
{
  "text": "This is a sample document text to analyze..."
}
```
**Response:**
```json
{
  "analysis": "JSON response with analysis details"
}
```

### 18. Update Personal Document Status
**POST** `/update-personal-doc-status/` (Employee)
```json
{
  "document_id": "doc-uuid",
  "status": "done",
  "comments": "Reviewed and approved"
}
```
**Response:**
```json
{
  "message": "Personal document status updated successfully"
}
```

### 19. Get Employee Document Status
**GET** `/employee-document-status/{document_id}` (Admin only)

**Response:**
```json
{
  "document_id": "doc-uuid",
  "document_name": "resume.pdf",
  "employee_statuses": [
    {
      "document_id": "doc-uuid",
      "employee_email": "jane@example.com",
      "employee_name": "Jane Smith",
      "department_name": "HR",
      "personal_status": "done",
      "comments": "Approved"
    }
  ]
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "Document not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error message describing the issue"
}
```

---

## Notes

1. **Authentication**: All endpoints require session authentication except `/signup/`, `/verify-signup-otp/`, `/login/`, `/forgot-password/`, and `/reset-password/`
2. **Admin Only**: Endpoints marked "(Admin only)" require the user to be an admin
3. **CORS**: Frontend URLs must be whitelisted in `.env` (CORS_ORIGINS)
4. **Session Management**: Uses HTTP-only session cookies for security
5. **File Upload**: Uses Cloudinary for secure file storage
6. **Email**: Automated OTP and password emails via Gmail SMTP
7. **AI Analysis**: Uses Google Gemini API for document analysis
