'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getCurrentUser, User } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Document {
  document_id: string;
  file_name: string;
  file_url?: string;
  content_type: string;
  document_type?: string;
  summary?: string;
  urgency_score?: number;
  importance_score?: number;
  uploaded_by: string;
  timestamp: string;
  analyzed_at?: string;
  departments_responsible?: string[];
  key_findings?: string[];
}

interface PersonalDocStatus {
  document_id: string;
  employee_email: string;
  personal_status: 'pending' | 'in_progress' | 'done' | 'ignored';
  comments?: string;
  last_updated?: string;
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docStatuses, setDocStatuses] = useState<Map<string, PersonalDocStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusComments, setStatusComments] = useState('');

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          if (!response.user.isAdmin) {
            await fetchDocuments();
          }
        } else {
          setError('Please log in to view your documents');
        }
      } catch (err) {
        setError('Failed to load user data');
      }
    };

    checkAuthAndLoad();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/my-documents/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        
        // Build status map from personal_doc_statuses
        const statuses = new Map();
        if (data.personal_doc_statuses) {
          data.personal_doc_statuses.forEach((status: PersonalDocStatus) => {
            statuses.set(status.document_id, status);
          });
        }
        setDocStatuses(statuses);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (docId: string, newStatus: string) => {
    setError('');
    setMessage('');
    setUpdatingStatus(docId);

    try {
      const response = await fetch(`${API_BASE_URL}/update-personal-doc-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          document_id: docId,
          status: newStatus,
          comments: statusComments || undefined,
        }),
      });

      if (response.ok) {
        setMessage(`Status updated to ${newStatus}`);
        setStatusComments('');
        await fetchDocuments();
        setViewingDoc(null);
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'ignored':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-xl">Please log in to view your documents</p>
          </div>
        </div>
      </>
    );
  }

  if (user.isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-xl">Admins should use the Admin Dashboard</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Documents</h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{user.name}</span> | Department: <span className="font-semibold">{user.department_name}</span>
            </p>
          </div>

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

          {/* Documents List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No documents assigned yet</p>
              <p className="text-gray-500 mt-2">Documents will appear here once assigned by your admin</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => {
                const status = docStatuses.get(doc.document_id);
                const currentStatus = status?.personal_status || 'pending';

                return (
                  <div key={doc.document_id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 cursor-pointer" onClick={() => setViewingDoc(doc)}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">{doc.file_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 Assigned: {new Date(doc.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                          {currentStatus === 'in_progress' ? 'In Progress' : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {doc.content_type}
                        </span>
                      </div>
                    </div>

                    {doc.summary && (
                      <p className="text-gray-700 mb-4 line-clamp-2">{doc.summary}</p>
                    )}

                    {doc.urgency_score !== undefined && (
                      <div className="flex gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Urgency</p>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${doc.urgency_score}%` }} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Importance</p>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${doc.importance_score}%` }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                      >
                        View Details
                      </button>
                      {currentStatus !== 'done' && currentStatus !== 'ignored' && (
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Document Detail & Status Modal */}
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

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-8 space-y-6">
                  {/* Current Status */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Current Status:</strong>{' '}
                      <span className={`font-semibold ml-2 px-3 py-1 rounded-full inline-block ${getStatusColor(docStatuses.get(viewingDoc.document_id)?.personal_status || 'pending')}`}>
                        {(docStatuses.get(viewingDoc.document_id)?.personal_status || 'pending').replace('_', ' ')}
                      </span>
                    </p>
                  </div>

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
                      <div className="grid grid-cols-2 gap-4">
                        {viewingDoc.urgency_score !== undefined && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2 font-semibold">Urgency Score</p>
                            <div className="bg-gray-200 rounded-full h-3 mb-2">
                              <div className="bg-red-500 h-3 rounded-full" style={{ width: `${viewingDoc.urgency_score}%` }} />
                            </div>
                            <p className="text-lg font-bold text-gray-900">{viewingDoc.urgency_score}%</p>
                          </div>
                        )}
                        {viewingDoc.importance_score !== undefined && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2 font-semibold">Importance Score</p>
                            <div className="bg-gray-200 rounded-full h-3 mb-2">
                              <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${viewingDoc.importance_score}%` }} />
                            </div>
                            <p className="text-lg font-bold text-gray-900">{viewingDoc.importance_score}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Findings */}
                  {viewingDoc.key_findings && viewingDoc.key_findings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Key Findings</h3>
                      <ul className="space-y-2">
                        {viewingDoc.key_findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <span className="text-blue-600 mr-3 font-bold">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Status Update Form */}
                  {(docStatuses.get(viewingDoc.document_id)?.personal_status || 'pending') !== 'done' &&
                    (docStatuses.get(viewingDoc.document_id)?.personal_status || 'pending') !== 'ignored' && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Update Status</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">New Status</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['in_progress', 'done', 'ignored'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(viewingDoc.document_id, status)}
                                disabled={updatingStatus === viewingDoc.document_id}
                                className={`py-2 rounded-lg transition font-semibold text-sm ${
                                  status === 'in_progress'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : status === 'done'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                } disabled:opacity-50`}
                              >
                                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Comments (Optional)</label>
                          <textarea
                            value={statusComments}
                            onChange={(e) => setStatusComments(e.target.value)}
                            placeholder="Add any comments..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t flex gap-3 shrink-0">
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
      </div>
    </>
  );
}
