'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, User } from '@/lib/api';
import DepartmentManagement from './DepartmentManagement';
import EmployeeManagement from './EmployeeManagement';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'departments'>('overview');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
          if (!response.user.isAdmin) {
            window.location.href = '/';
            return;
          }
          setUser(response.user);
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome, <span className="font-semibold">{user.name}</span> • 
              <span className="ml-2 text-blue-600 font-semibold">{user.company_name}</span>
            </p>
          </div>
          <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Company</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{user.company_name}</p>
              </div>
              <div className="text-4xl text-blue-600">🏢</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Your Role</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">Administrator</p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Departments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
              </div>
              <div className="text-4xl">📂</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border-b border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'departments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📁 Departments
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Employees
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Admin Dashboard</h2>
                  <p className="text-gray-700 mb-4">
                    Manage your organization's departments and employees from this centralized dashboard.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📁</span>
                      <div>
                        <p className="font-semibold text-gray-900">Create Departments</p>
                        <p className="text-gray-600 text-sm">Organize your company structure by creating departments</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">👥</span>
                      <div>
                        <p className="font-semibold text-gray-900">Add Employees</p>
                        <p className="text-gray-600 text-sm">Invite employees to your company and assign them to departments</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📄</span>
                      <div>
                        <p className="font-semibold text-gray-900">Upload Documents</p>
                        <p className="text-gray-600 text-sm">Upload documents for AI analysis and assign them to departments</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📊</span>
                      <div>
                        <p className="font-semibold text-gray-900">Track Progress</p>
                        <p className="text-gray-600 text-sm">Monitor document processing status and employee actions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">🚀</span>
                      Quick Start
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">1.</span>
                        <span>Create departments for your organization</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">2.</span>
                        <span>Add employees and assign them to departments</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">3.</span>
                        <span>Upload documents for processing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">4.</span>
                        <span>Route documents to appropriate departments</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">💡</span>
                      Tips & Best Practices
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✓ Organize departments logically (by team, function, location)</li>
                      <li>✓ Use clear and descriptive department names</li>
                      <li>✓ Keep employee email addresses up to date</li>
                      <li>✓ Review document analysis results before routing</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <DepartmentManagement />
            )}

            {activeTab === 'employees' && (
              <EmployeeManagement />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
