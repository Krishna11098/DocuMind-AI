# Integration Guide - Adding Department Management to Your App

## 🎯 Current Status

Department management APIs and UI component are **ready to use**. You can integrate them into your main dashboard immediately.

## 📍 Where to Add Department Links

### Option 1: Add to Navbar (Recommended)

Edit `frontend/src/components/Navbar.tsx`:

```tsx
// After the "Contact" link, add:
{user && user.isAdmin && (
  <a href="/departments" className="hover:text-blue-200 transition">
    Departments
  </a>
)}
```

### Option 2: Create Department Management Page

Create `frontend/src/app/departments/page.tsx`:

```tsx
'use client';

import DepartmentManagement from '@/components/DepartmentManagement';

export default function DepartmentsPage() {
  return <DepartmentManagement />;
}
```

Then add link to navbar:
```tsx
<a href="/departments" className="hover:text-blue-200 transition">
  Departments
</a>
```

### Option 3: Create Admin Dashboard

Create `frontend/src/app/admin/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, User } from '@/lib/api';
import DepartmentManagement from '@/components/DepartmentManagement';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getCurrentUser();
      if (response.success && response.user?.isAdmin) {
        setUser(response.user);
      } else {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
            <div className="space-y-2">
              <p>Company: <span className="font-semibold">{user.company_name}</span></p>
              <p>Departments: <span className="font-semibold">{user.departments?.length || 0}</span></p>
              <p>Role: <span className="font-semibold">Admin</span></p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/admin/departments" className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                → Manage Departments
              </a>
              <a href="/admin/employees" className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                → Manage Employees
              </a>
            </div>
          </div>
        </div>

        {/* Full Department Management */}
        <div className="mt-12">
          <DepartmentManagement />
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Configuration Needed

### 1. Ensure Backend is Running
```bash
cd backend
uvicorn main:app --reload
```

### 2. Ensure Frontend Environment is Set
Check `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Ensure CORS is Configured
Check `backend/.env`:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📱 Adding to Navbar Example

Here's a complete navbar integration:

```tsx
'use client';

import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { logout, getCurrentUser, User } from '@/lib/api';
import Link from 'next/link';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              DocuMind AI
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-200 transition">
                Features
              </a>
              <a href="#about" className="hover:text-blue-200 transition">
                About
              </a>
              
              {/* ADMIN ONLY - Add this */}
              {user && user.isAdmin && (
                <>
                  <Link href="/admin/departments" className="hover:text-blue-200 transition">
                    Departments
                  </Link>
                  <Link href="/admin/employees" className="hover:text-blue-200 transition">
                    Employees
                  </Link>
                  <Link href="/admin/documents" className="hover:text-blue-200 transition">
                    Documents
                  </Link>
                </>
              )}

              {/* EMPLOYEE - Add this */}
              {user && !user.isAdmin && (
                <Link href="/documents" className="hover:text-blue-200 transition">
                  My Documents
                </Link>
              )}

              <a href="#contact" className="hover:text-blue-200 transition">
                Contact
              </a>
            </div>

            {/* Auth Area */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-20 h-8 bg-blue-700 rounded animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    Welcome, <span className="font-semibold">{user.name}</span>
                  </span>
                  {user.isAdmin && (
                    <span className="px-2 py-1 bg-yellow-500 text-xs rounded-full font-semibold">
                      Admin
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowLogin(false);
          }}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowSignup(false);
          }}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
}
```

## 🎨 Styling the Department Page

For a nice layout, wrap DepartmentManagement in a layout:

```tsx
// app/admin/departments/page.tsx
import Navbar from '@/components/Navbar';
import DepartmentManagement from '@/components/DepartmentManagement';

export default function DepartmentsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <DepartmentManagement />
      </div>
    </>
  );
}
```

## ✅ Testing Checklist

After integration:

- [ ] Navbar shows department link only for admins
- [ ] Can navigate to department page
- [ ] Can create department
- [ ] Department appears in list
- [ ] Can add employees
- [ ] Employees show in department
- [ ] Employee count updates
- [ ] Non-admins don't see department links
- [ ] Logout clears auth state
- [ ] Login restores user data

## 🚨 Troubleshooting

### Department page shows "Only admins can manage departments"
- Ensure you're logged in
- Ensure you signed up as an admin
- Clear browser cache and reload

### Can't create department
- Check backend is running on port 8000
- Check CORS configuration
- Check browser console for errors
- Ensure you're authenticated (cookies)

### Departments list is empty
- Create a department first!
- No departments = empty list
- Click "Create Department" button

### API returns 401 Unauthorized
- You're not logged in
- Session cookie expired
- Try logging out and back in

## 📚 API Summary for Reference

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/create-department/` | POST | Create new department | Admin |
| `/departments/` | GET | List all departments | Admin |
| `/add-employee/` | POST | Add employee to dept | Admin |
| `/me/` | GET | Get current user | Any |

## 🎉 You're All Set!

The department management feature is fully integrated and ready to use. Start your servers and test it out!

```bash
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - (optional) Check logs
```

Visit `http://localhost:3000` and sign up as an admin to test!
