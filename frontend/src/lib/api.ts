// API utility functions for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  name: string;
  email: string;
  company_name: string;
  isAdmin: boolean;
  department_name?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  user?: User;
  data?: T;
}

// Signup
export async function signup(data: {
  name: string;
  email: string;
  password: string;
  company_name: string;
}) {
  const response = await fetch(`${API_BASE_URL}/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Verify OTP
export async function verifySignupOtp(data: { email: string; otp: string }) {
  const response = await fetch(`${API_BASE_URL}/verify-signup-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Resend OTP
export async function resendSignupOtp() {
  const response = await fetch(`${API_BASE_URL}/resend-signup-otp/`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}

// Login
export async function login(data: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Logout
export async function logout() {
  const response = await fetch(`${API_BASE_URL}/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}

// Get current user
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/me/`, {
    credentials: 'include',
  });
  return response.json();
}

// Forgot password
export async function forgotPassword(email: string) {
  const response = await fetch(`${API_BASE_URL}/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  return response.json();
}

// Reset password
export async function resetPassword(data: {
  email: string;
  otp: string;
  new_password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Department Management
export async function createDepartment(data: {
  department_name: string;
  description?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/create-department/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getDepartments() {
  const response = await fetch(`${API_BASE_URL}/departments/`, {
    credentials: 'include',
  });
  return response.json();
}

export async function deleteDepartment(departmentId: string) {
  const response = await fetch(`${API_BASE_URL}/delete-department/${departmentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
}

// Employee Management
export async function addEmployee(data: {
  name: string;
  email: string;
  department_name: string;
}) {
  const response = await fetch(`${API_BASE_URL}/add-employee/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteEmployee(employeeEmail: string) {
  const response = await fetch(`${API_BASE_URL}/delete-employee/${encodeURIComponent(employeeEmail)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
}
