'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AnalysisResult {
  summary: string;
  document_type: string;
  key_findings: string[];
  urgency_score: number;
  importance_score: number;
  departments_responsible: string[];
  confidence: number;
}

export default function TextAnalyzer() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('text', text);

      const response = await fetch(`${API_BASE_URL}/analyze-text/`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!analysis) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', documentTitle || `Text Document - ${new Date().toLocaleDateString()}`);
      formData.append('content', text);
      formData.append('analyze', 'true');

      const response = await fetch(`${API_BASE_URL}/create-text-document/`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const data = await response.json();
      alert('Document created successfully! You can now assign it to departments.');
      router.push('/documents');
    } catch (err) {
      setError('Failed to create document. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setShowTitleModal(false);
      setDocumentTitle('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Text Analyzer</h1>
          <p className="text-gray-600 text-center mb-8">Enter any text to get AI-powered analysis</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Your Text</h2>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here..."
                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">{text.length} characters</p>
                </div>

                <button
                  type="submit"
                  disabled={analyzing || !text.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Text'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Analysis Results Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
              
              {!analysis ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Enter text and click "Analyze Text" to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>

                  {/* Document Type */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Document Type</h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {analysis.document_type}
                    </span>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Urgency Score</p>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${analysis.urgency_score}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{analysis.urgency_score}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Importance Score</p>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${analysis.importance_score}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{analysis.importance_score}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Confidence</p>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analysis.confidence}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{analysis.confidence}%</p>
                    </div>
                  </div>

                  {/* Key Findings */}
                  {analysis.key_findings && analysis.key_findings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Key Findings</h3>
                      <ul className="space-y-1">
                        {analysis.key_findings.map((finding, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Departments Responsible */}
                  {analysis.departments_responsible && analysis.departments_responsible.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Departments Responsible</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.departments_responsible.map((dept, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Document Button */}
                  <button
                    onClick={() => setShowTitleModal(true)}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Creating Document...' : '💾 Save as Document'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title Modal */}
        {showTitleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Document</h3>
              <p className="text-gray-600 mb-6">Enter a title for this document:</p>
              
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., Q4 Budget Review"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 mb-6"
                autoFocus
              />

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowTitleModal(false);
                    setDocumentTitle('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={loading || !documentTitle.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
