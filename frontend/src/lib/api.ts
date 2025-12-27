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
export async function getCurrentUser(signal?: AbortSignal): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/me/`, {
    credentials: 'include',
    signal,
  });
  return response.json();
}

// Forgot/reset password removed - users contact admin

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
  password: string;
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
