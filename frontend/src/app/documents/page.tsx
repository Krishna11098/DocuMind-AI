'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Document {
  document_id: string;
  file_name: string;
  content_type: string;
  document_type?: string;
  summary?: string;
  urgency_score?: number;
  importance_score?: number;
  processing_status: string;
  uploaded_by: string;
  timestamp: string;
  analyzed_at?: string;
  departments_assigned?: string[];
  departments_responsible?: string[];
  key_findings?: string[];
}

interface EmployeeStatus {
  employee_email: string;
  employee_name?: string;
  department_name?: string;
  personal_status: string;
  comments?: string;
  last_updated?: string;
}

type TabType = 'upload' | 'list' | 'assign';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [employeeStatuses, setEmployeeStatuses] = useState<Record<string, EmployeeStatus[]>>({});
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/departments/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const deptNames = data.departments?.map((d: any) => d.department_name) || [];
        setDepartments(deptNames);
      }
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setMessage('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload-file/`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setMessage(`File uploaded successfully! (ID: ${data.document_id})`);
      setFile(null);
      await fetchDocuments();
      setActiveTab('list');
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeDocument = async (docId: string) => {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-document/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ document_id: docId }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      setMessage('Document analyzed successfully!');
      await fetchDocuments();
    } catch (err) {
      setError('Failed to analyze document');
    }
  };

  const handleSelectForAssignment = (doc: Document) => {
    setSelectedDoc(doc);
    setSelectedDepartments([]);
    setActiveTab('assign');
    fetchDepartments();
  };

  const handleAssignDocument = async () => {
    if (!selectedDoc || selectedDepartments.length === 0) {
      setError('Please select at least one department');
      return;
    }

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/assign-document/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          document_id: selectedDoc.document_id,
          departments: selectedDepartments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign document');
      }

      setMessage(`Document assigned to ${selectedDepartments.length} department(s)`);
      setSelectedDoc(null);
      setSelectedDepartments([]);
      await fetchDocuments();
      setActiveTab('list');
    } catch (err) {
      setError('Failed to assign document');
    }
  };

  const fetchEmployeeStatuses = async (docId: string) => {
    // Avoid refetching if already loaded
    if (employeeStatuses[docId]) return;
    setStatusLoading(docId);
    try {
      const response = await fetch(`${API_BASE_URL}/employee-document-status/${docId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmployeeStatuses((prev) => ({ ...prev, [docId]: data.employee_statuses || [] }));
      }
    } catch (err) {
      // best-effort; keep UI responsive
    } finally {
      setStatusLoading(null);
    }
  };

  const handleOpenDocument = (doc: Document) => {
    setViewingDoc(doc);
    if (doc.processing_status === 'assigned') {
      fetchEmployeeStatuses(doc.document_id);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Document Management</h1>
          <p className="text-gray-600 text-center mb-8">Upload, analyze, and assign documents</p>

          {/* Messages */}
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

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-3 px-6 font-semibold transition ${
                activeTab === 'upload'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📤 Upload Document
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 px-6 font-semibold transition ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 My Documents
            </button>
            {selectedDoc && (
              <button
                onClick={() => setActiveTab('assign')}
                className={`py-3 px-6 font-semibold transition ${
                  activeTab === 'assign'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✓ Assign Document
              </button>
            )}
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h2>
              <form onSubmit={handleUploadFile} className="space-y-6">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    required
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="font-semibold text-gray-900">Choose a file or drag and drop</p>
                    <p className="text-sm text-gray-600 mt-1">PDF, images (JPG, PNG, GIF)</p>
                    {file && (
                      <p className="text-sm text-green-600 mt-2 font-semibold">✓ {file.name}</p>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>
            </div>
          )}

          {/* List Tab */}
          {activeTab === 'list' && (
            <div>
              {loading ? (
                <p className="text-center text-gray-600">Loading documents...</p>
              ) : documents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <p className="text-gray-600">No documents yet. Upload one to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div key={doc.document_id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 cursor-pointer" onClick={() => handleOpenDocument(doc)}>
                          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">{doc.file_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            📅 {new Date(doc.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            doc.processing_status === 'analyzed'
                              ? 'bg-green-100 text-green-700'
                              : doc.processing_status === 'assigned'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {doc.processing_status}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {doc.content_type}
                          </span>
                        </div>
                      </div>

                      {doc.summary && (
                        <p className="text-gray-700 mb-4">{doc.summary}</p>
                      )}

                      {doc.departments_responsible && doc.departments_responsible.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-800 mb-2">Responsible Departments (suggested)</p>
                          <div className="flex flex-wrap gap-2">
                            {doc.departments_responsible.map((dept) => (
                              <span key={dept} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold">
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {doc.document_type && (
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Type:</strong> {doc.document_type}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenDocument(doc)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                        >
                          View Details
                        </button>
                        {doc.processing_status !== 'analyzed' && doc.processing_status !== 'assigned' && (
                          <button
                            onClick={() => handleAnalyzeDocument(doc.document_id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                          >
                            Analyze
                          </button>
                        )}
                        {doc.processing_status === 'analyzed' && (
                          <button
                            onClick={() => handleSelectForAssignment(doc)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assign Tab */}
          {activeTab === 'assign' && selectedDoc && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Document to Departments</h2>
              
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Document:</strong> {selectedDoc.file_name}
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Select Departments
                </label>

                {departmentsLoading ? (
                  <p className="text-gray-600">Loading departments...</p>
                ) : departments.length === 0 ? (
                  <p className="text-gray-600">No departments available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map((dept) => (
                      <label key={dept} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDepartments([...selectedDepartments, dept]);
                            } else {
                              setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-900 font-medium">{dept}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleAssignDocument}
                  disabled={selectedDepartments.length === 0}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  ✓ Assign to Selected Departments
                </button>
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setActiveTab('list');
                  }}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Document Detail View Modal */}
        {viewingDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white p-8 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold">{viewingDoc.file_name}</h2>
                    <p className="text-blue-100 mt-2">
                      📅 {new Date(viewingDoc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="text-2xl hover:text-blue-200 transition shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto flex-1 p-8 space-y-6">
                {/* Summary */}
                {viewingDoc.summary && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{viewingDoc.summary}</p>
                  </div>
                )}

                {/* Document Type */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Document Type</h3>
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {viewingDoc.document_type || 'Unknown'}
                  </span>
                </div>

                {/* Scores */}
                {(viewingDoc.urgency_score !== undefined || viewingDoc.importance_score !== undefined) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Metrics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {viewingDoc.urgency_score !== undefined && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2 font-semibold">Urgency Score</p>
                          <div className="bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-red-500 h-3 rounded-full transition-all"
                              style={{ width: `${viewingDoc.urgency_score}%` }}
                            />
                          </div>
                          <p className="text-lg font-bold text-gray-900">{viewingDoc.urgency_score}%</p>
                        </div>
                      )}
                      {viewingDoc.importance_score !== undefined && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2 font-semibold">Importance Score</p>
                          <div className="bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-orange-500 h-3 rounded-full transition-all"
                              style={{ width: `${viewingDoc.importance_score}%` }}
                            />
                          </div>
                          <p className="text-lg font-bold text-gray-900">{viewingDoc.importance_score}%</p>
                        </div>
                      )}
                      {/* Confidence would be displayed if available */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2 font-semibold">Status</p>
                        <div className="bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <p className="text-lg font-bold text-gray-900">✓</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Findings */}
                {viewingDoc.key_findings && viewingDoc.key_findings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Key Findings</h3>
                    <ul className="space-y-2">
                      {viewingDoc.key_findings.map((finding: string, idx: number) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <span className="text-blue-600 mr-3 font-bold">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Departments Responsible / Assigned */}
                {(viewingDoc.departments_responsible && viewingDoc.departments_responsible.length > 0) ||
                  (viewingDoc.departments_assigned && viewingDoc.departments_assigned.length > 0) ? (
                  <div className="space-y-3">
                    {viewingDoc.departments_responsible && viewingDoc.departments_responsible.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Responsible Departments (suggested)</h3>
                        <div className="flex flex-wrap gap-2">
                          {viewingDoc.departments_responsible.map((dept, idx) => (
                            <span key={idx} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-semibold text-sm">
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewingDoc.departments_assigned && viewingDoc.departments_assigned.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Assigned Departments</h3>
                        <div className="flex flex-wrap gap-2">
                          {viewingDoc.departments_assigned.map((dept: string, idx: number) => (
                            <span key={idx} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Employee status (after assignment) */}
                {viewingDoc.processing_status === 'assigned' && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Employee Status</h3>
                      {statusLoading === viewingDoc.document_id && (
                        <span className="text-sm text-gray-500">Loading...</span>
                      )}
                      {statusLoading === viewingDoc.document_id ? null : (
                        <button
                          onClick={() => fetchEmployeeStatuses(viewingDoc.document_id)}
                          className="text-sm text-blue-600 hover:underline font-semibold"
                        >
                          Refresh
                        </button>
                      )}
                    </div>
                    {employeeStatuses[viewingDoc.document_id] && employeeStatuses[viewingDoc.document_id].length > 0 ? (
                      <div className="space-y-3">
                        {employeeStatuses[viewingDoc.document_id].map((status) => (
                          <div key={status.employee_email} className="p-3 bg-white rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{status.employee_name || status.employee_email}</p>
                                <p className="text-sm text-gray-600">{status.department_name || 'N/A'}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                {status.personal_status.replace('_', ' ')}
                              </span>
                            </div>
                            {status.comments && (
                              <p className="text-sm text-gray-700 mt-2">{status.comments}</p>
                            )}
                            {status.last_updated && (
                              <p className="text-xs text-gray-500 mt-1">Updated: {new Date(status.last_updated).toLocaleString()}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No updates from employees yet.</p>
                    )}
                  </div>
                )}

                {/* Status Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong>{' '}
                    <span className={`font-semibold ${
                      viewingDoc.processing_status === 'assigned'
                        ? 'text-green-600'
                        : viewingDoc.processing_status === 'analyzed'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}>
                      {viewingDoc.processing_status.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Type:</strong> {viewingDoc.content_type}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 p-6 border-t flex gap-3 shrink-0">
                {viewingDoc.processing_status === 'analyzed' && (
                  <button
                    onClick={() => {
                      handleSelectForAssignment(viewingDoc);
                      setViewingDoc(null);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Assign to Departments
                  </button>
                )}
                <button
                  onClick={() => setViewingDoc(null)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

