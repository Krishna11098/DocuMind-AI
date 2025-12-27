'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, User, createDepartment, getDepartments, deleteDepartment } from '@/lib/api';

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

export default function DepartmentManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);
  const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);

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
      const data = await getDepartments();
      if (data.success) {
        setDepartments(data.departments || []);
      } else {
        setError(data.message || 'Failed to load departments');
      }
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setCreatingDept(true);

    try {
      const data = await createDepartment({
        department_name: newDepartmentName,
        description: newDepartmentDescription,
      });
      if (data.success) {
        setMessage(data.message);
        setNewDepartmentName('');
        setNewDepartmentDescription('');
        setShowCreateForm(false);
        await fetchDepartments();
      } else {
        setError(data.message || 'Failed to create department');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setCreatingDept(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to delete the department "${departmentName}" and all its employees?`)) {
      return;
    }

    setError('');
    setMessage('');
    setDeletingDeptId(departmentId);

    try {
      const data = await deleteDepartment(departmentId);
      if (data.success) {
        setMessage(`Department "${departmentName}" deleted successfully (${data.deleted_employees_count} employees removed)`);
        await fetchDepartments();
      } else {
        setError(data.detail || 'Failed to delete department');
      }
    } catch (err) {
      setError('An error occurred while deleting the department');
    } finally {
      setDeletingDeptId(null);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Only admins can manage departments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
          {message}
        </div>
      )}

      {/* Create Department Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {showCreateForm ? 'Cancel' : '+ Create Department'}
        </button>
      </div>

      {/* Create Department Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Department</h2>
          <form onSubmit={handleCreateDepartment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newDepartmentDescription}
                onChange={(e) => setNewDepartmentDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={creatingDept}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {creatingDept ? 'Creating...' : 'Create Department'}
            </button>
          </form>
        </div>
      )}

      {/* Departments List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No departments created yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {departments.map((dept) => (
            <div key={dept.department_id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{dept.department_name}</h3>
                  {dept.description && (
                    <p className="text-gray-600 mt-1">{dept.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                    {dept.employee_count} {dept.employee_count === 1 ? 'Member' : 'Members'}
                  </span>
                  <button
                    onClick={() => handleDeleteDepartment(dept.department_id, dept.department_name)}
                    disabled={deletingDeptId === dept.department_id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 text-sm"
                  >
                    {deletingDeptId === dept.department_id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Employees in Department */}
              {dept.employees.length > 0 ? (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {dept.employees.map((employee) => (
                      <div key={employee.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                        {employee.isAdmin && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic mt-4">No employees in this department yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
