'use client';

import { useState, useEffect } from 'react';
import { addEmployee, getDepartments, getCurrentUser, User } from '@/lib/api';

interface Department {
  department_id: string;
  department_name: string;
  description?: string;
  employee_count: number;
  employees: Array<{
    name: string;
    email: string;
    isAdmin: boolean;
    department_name: string;
  }>;
}

export default function EmployeeManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          if (response.user.isAdmin) {
            await fetchDepartments();
          }
        }
      } catch (err) {
        setError('Failed to load user data');
      }
    };

    checkAuthAndLoad();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.departments || []);
      } else {
        setError(response.message || 'Failed to load departments');
      }
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setAdding(true);

    try {
      const response = await addEmployee({
        name,
        email,
        department_name: selectedDepartment,
      });

      if (response.success) {
        setMessage(`Employee ${name} added successfully! Password sent to ${email}`);
        setName('');
        setEmail('');
        setSelectedDepartment('');
        setShowAddForm(false);
        // Refresh departments to see updated employee count
        await fetchDepartments();
      } else {
        setError(response.message || 'Failed to add employee');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Only admins can manage employees.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Management</h1>
      <p className="text-gray-600 mb-8">Add employees to your company and manage their departments</p>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg border border-green-200">
          {message}
        </div>
      )}

      {/* Add Employee Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add New Employee'}
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Employee</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select a department...</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  ⚠️ No departments created yet. Create a department first.
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>ℹ️ Note:</strong> A password will be auto-generated and sent to the employee's email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={adding || departments.length === 0}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding Employee...' : 'Add Employee'}
            </button>
          </form>
        </div>
      )}

      {/* Employees List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading departments and employees...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No departments created yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {departments.map((dept) => (
            <div key={dept.department_id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Department Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">{dept.department_name}</h3>
                    {dept.description && (
                      <p className="text-blue-100 mt-1">{dept.description}</p>
                    )}
                  </div>
                  <span className="px-4 py-2 bg-white text-blue-600 rounded-full font-semibold text-lg">
                    {dept.employee_count} {dept.employee_count === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
              </div>

              {/* Employees in Department */}
              <div className="p-6">
                {dept.employees.length > 0 ? (
                  <div className="space-y-3">
                    {dept.employees.map((employee, idx) => (
                      <div
                        key={employee.email}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{employee.name}</p>
                              <p className="text-sm text-gray-600">{employee.email}</p>
                            </div>
                          </div>
                        </div>
                        {employee.isAdmin && (
                          <span className="px-3 py-1 ml-4 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                            ADMIN
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">No employees in this department yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
