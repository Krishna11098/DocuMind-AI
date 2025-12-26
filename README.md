# 🧠 DocuMind-AI

<div align="center">

**Intelligent Document Management & Analysis Platform for Modern Organizations**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://www.python.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)](https://ai.google.dev/)

[Live Demo](#) • [Documentation](./API_DOCUMENTATION.md) • [Admin Guide](./ADMIN_FEATURES_SUMMARY.md)

</div>

---

## 🌍 Why DocuMind-AI is Critically Needed in Today's World

In an era of **information overload**, organizations are drowning in documents. Studies show that:

- 📊 **Knowledge workers spend 19% of their time searching for information** (McKinsey)
- 💸 **Fortune 500 companies lose $31.5B annually** due to poor document management
- ⏱️ **40% of employee productivity** is lost to inefficient document workflows
- 🔥 **Critical documents get lost in email threads**, causing compliance risks and delayed decisions

**DocuMind-AI solves this crisis** by bringing intelligent, AI-powered document analysis and automated organizational workflows to businesses of all sizes. We transform document chaos into actionable intelligence.

---

## 🎯 What is DocuMind-AI Built For?

DocuMind-AI is an **enterprise-grade, AI-powered document management system** designed to:

### 🔍 Intelligent Document Analysis
- **Automatic AI Analysis**: Using Google's Gemini AI to extract summaries, key findings, and urgency scores
- **Smart Classification**: Auto-categorizes documents by type, urgency, and responsible departments
- **OCR & Multi-Format Support**: Extracts text from PDFs, images, and scanned documents

### 🏢 Multi-Tenant Organization Management
- **Company Isolation**: Secure multi-tenant architecture ensuring complete data separation
- **Departmental Structure**: Hierarchical organization with department-based access control
- **Role-Based Access**: Admin, manager, and employee roles with granular permissions

### 📨 Automated Workflows
- **Employee Onboarding**: Auto-generate credentials and send welcome emails
- **Document Assignment**: Automatically route documents to relevant departments
- **Status Tracking**: Real-time document lifecycle management (Pending → In Review → Approved/Rejected)
- **Email Notifications**: Automated OTP verification and credential delivery

### 🔐 Enterprise Security
- **Session-Based Authentication**: Secure, HttpOnly cookie-based sessions
- **OTP Email Verification**: Two-factor signup process
- **Password Reset Flow**: Secure forgot/reset password mechanism
- **Firestore Database**: Google Cloud's scalable, secure NoSQL database

---

## ✅ Current Implementation Status

### 🎉 **Fully Completed Features** (Production-Ready)

#### 🔐 Authentication System (100% Complete)
- [x] User signup with company registration
- [x] Email OTP verification system
- [x] Secure login/logout with sessions
- [x] Password hashing with SHA-256
- [x] Forgot password flow
- [x] Reset password with OTP
- [x] Auto-resend OTP functionality
- [x] Session management with HttpOnly cookies

#### 👨‍💼 Admin Dashboard (100% Complete)
- [x] Complete admin dashboard with 3 tabs (Overview, Departments, Employees)
- [x] Quick stats and analytics
- [x] Department creation and management
- [x] Employee management with auto-credentials
- [x] Department-based employee organization
- [x] Real-time employee count badges
- [x] Visual employee avatars with initials
- [x] Admin-only route protection

#### 🏢 Department Management (100% Complete)
- [x] Create departments with descriptions
- [x] View all company departments
- [x] Employee count per department
- [x] Department-employee association
- [x] Company-scoped department isolation
- [x] Duplicate prevention

#### 📄 Document Management System (100% Complete)
- [x] Document upload to Cloudinary CDN
- [x] File type validation (PDF, images)
- [x] AI-powered document analysis with Gemini
- [x] Document summary generation
- [x] Urgency and importance scoring
- [x] Department assignment
- [x] Document status workflow (Pending/In Review/Approved/Rejected)
- [x] Personal document tracking for employees
- [x] Document listing with filters
- [x] Document assignment to employees

#### 🎨 Frontend Components (100% Complete)
- [x] Modern Next.js 16 with React 19
- [x] TypeScript for type safety
- [x] Tailwind CSS v4 for styling
- [x] Responsive navbar with conditional rendering
- [x] Modal-based signup/login
- [x] Admin dashboard UI
- [x] Department management UI
- [x] Employee management UI
- [x] Protected routes
- [x] Loading states and error handling

#### 🔧 Backend Architecture (100% Complete)
- [x] FastAPI REST API
- [x] Firebase Firestore integration
- [x] Session middleware
- [x] CORS configuration
- [x] Environment-based configuration
- [x] Email service (SMTP with Gmail)
- [x] Cloudinary integration
- [x] Google Gemini AI integration
- [x] PDF text extraction
- [x] Image analysis
- [x] Comprehensive API endpoints (18+)

---

## 🚀 Coming in Next 48-72 Hours

### 1. 📊 **Advanced Analytics Dashboard** (24 hours)
- [ ] Real-time metrics: documents processed, pending reviews, approval rates
- [ ] Department performance charts (Chart.js/Recharts)
- [ ] Employee productivity insights
- [ ] Document trends over time
- [ ] Export reports to PDF/Excel

**Why this matters**: Demonstrates **data visualization skills**, **async processing**, and **real-time analytics** - essential for modern data-driven organizations.

### 2. 🔍 **Semantic Search with Vector Embeddings** (36 hours)
- [ ] Integrate vector database (Pinecone/Weaviate)
- [ ] Generate embeddings for document content
- [ ] Natural language search queries
- [ ] "Find all contracts mentioning X" functionality
- [ ] Search result ranking by relevance

**Why this matters**: Shows understanding of **modern ML/AI techniques**, **vector databases**, and **information retrieval** - cutting-edge technology in the industry.

### 3. ⚡ **Real-Time Collaboration Features** (48 hours)
- [ ] WebSocket integration for live updates
- [ ] Real-time document status notifications
- [ ] Live user presence indicators
- [ ] Collaborative document comments
- [ ] Activity feed

**Why this matters**: Demonstrates **distributed systems knowledge**, **real-time architectures**, and **scalability thinking** - critical for enterprise-scale systems.

### 4. 🧪 **Automated Testing & CI/CD** (24 hours)
- [ ] Unit tests for backend (pytest)
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests (Jest/React Testing Library)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Code coverage reports (>80%)

**Why this matters**: Shows **software engineering discipline**, **quality assurance**, and **DevOps practices** - industry best practices.

### 5. 🐳 **Docker Containerization** (12 hours)
- [ ] Dockerfile for backend
- [ ] Dockerfile for frontend
- [ ] Docker Compose for local development
- [ ] Multi-stage builds for optimization
- [ ] Container orchestration ready

**Why this matters**: Demonstrates **cloud-native development**, **containerization**, and **deployment expertise** - essential for modern deployments.

---

## 🏗️ Architecture & Tech Stack

### Frontend
```
Next.js 16 (App Router) + React 19
├── TypeScript for type safety
├── Tailwind CSS v4 for styling
├── Client-side routing
├── Server-side rendering
└── API integration layer
```

### Backend
```
FastAPI (Python 3.11+)
├── RESTful API architecture
├── Session-based authentication
├── Firebase Firestore (NoSQL)
├── Google Gemini AI integration
├── Cloudinary CDN for files
├── Email service (SMTP)
└── Background task processing (Celery ready)
```

### AI/ML Pipeline
```
Google Gemini AI
├── Document text extraction
├── Content summarization
├── Entity recognition
├── Urgency classification
├── Department recommendation
└── Confidence scoring
```

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| **Backend Endpoints** | 18+ RESTful APIs |
| **Frontend Components** | 8 reusable components |
| **Database Collections** | 4 (users, departments, documents, personal_docs) |
| **AI Models Integrated** | 1 (Google Gemini Pro) |
| **Authentication Methods** | Session + OTP |
| **File Storage** | Cloudinary CDN |
| **Lines of Code** | ~2,000+ (backend + frontend) |
| **Development Time** | 2 weeks (solo developer) |

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
Python 3.11+
Firebase account
Cloudinary account
Google AI API key
Gmail for SMTP
```

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# Backend (.env)
SESSION_SECRET_KEY=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GENAI_API_KEY=your_gemini_key
EMAIL_SENDER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## 📖 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete endpoint reference
- [Admin Guide](./ADMIN_FEATURES_SUMMARY.md) - Admin dashboard walkthrough
- [Integration Guide](./INTEGRATION_GUIDE.md) - Third-party service setup
- [Quick Reference](./QUICK_REFERENCE.md) - Common workflows

---

## 🎓 What This Project Demonstrates

✅ **System Design**: Multi-tenant SaaS architecture with proper data isolation  
✅ **Scalability**: Designed for horizontal scaling with cloud services  
✅ **Security**: Session management, OTP verification, password hashing  
✅ **AI/ML Integration**: Practical use of LLMs for business value  
✅ **Full-Stack**: Modern frontend + robust backend  
✅ **API Design**: RESTful principles, proper error handling  
✅ **Database Design**: NoSQL schema design for Firestore  
✅ **Cloud Services**: Firebase, Cloudinary, Google AI  
✅ **Email Automation**: SMTP integration, templating  
✅ **Problem Solving**: Real-world business problem → technical solution  
✅ **Code Quality**: TypeScript, type safety, modular design  
✅ **Modern Tools**: Latest frameworks (Next.js 16, React 19)

---

## 🌟 Unique Value Propositions

1. **AI-First Approach**: Not just storage - intelligent document understanding
2. **Zero Configuration**: Auto-setup for new companies, instant onboarding
3. **Department Intelligence**: Smart routing based on document content
4. **Scalable Architecture**: Multi-tenant design ready for 1000s of companies
5. **Developer-Friendly**: Clean API, comprehensive docs, easy integration

---

## 📝 License

MIT License - Feel free to use this project for learning and interviews!

---

## 🤝 Contributing

This is an interview/portfolio project, but suggestions are welcome! Open an issue or submit a PR.

---

## 📧 Contact

**Email**: u24cs068@coed.svnit.ac.in  
**Institution**: Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat

---

<div align="center">

**Built with ❤️ to solve real-world problems using cutting-edge technology**

*"Turning document chaos into organizational clarity, one AI analysis at a time"*

</div>