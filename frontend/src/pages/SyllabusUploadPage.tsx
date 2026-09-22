import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  Plus,
  Trash2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Syllabus } from '../types';

export const SyllabusUploadPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staged files waiting to upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      const res = await api.get('/syllabus');
      setSyllabi(res.data.syllabi || []);
    } catch (err) {
      console.error('Failed to fetch syllabi list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((f) => {
        if (!f.name.toLowerCase().endsWith('.pdf')) {
          setError('Only PDF files are supported.');
          return false;
        }
        if (f.size > 15 * 1024 * 1024) {
          setError('Each PDF file size must be less than 15MB.');
          return false;
        }
        return true;
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
      if (droppedFiles.length === 0) {
        setError('Please drop valid PDF files.');
        return;
      }
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setUploading(true);
      setError(null);
      await api.post('/syllabus/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSelectedFiles([]);
      await fetchSyllabi();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process syllabus files.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSyllabus = async (id: string) => {
    try {
      await api.delete(`/syllabus/${id}`);
      fetchSyllabi();
    } catch (err) {
      console.error('Failed to delete syllabus', err);
    }
  };

  const handleReprocessSyllabus = async (id: string, customSubjectName?: string) => {
    try {
      await api.post(`/syllabus/${id}/process`, { subject_name: customSubjectName });
      fetchSyllabi();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reprocess file.');
    }
  };

  const hasProcessedSyllabus = syllabi.some((s) => s.status === 'PROCESSED');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Build Your Syllabus</h1>
              <p className="text-sm text-slate-500 mt-1">
                Upload your syllabus PDFs. You can upload one complete syllabus or separate PDFs for individual subjects.
              </p>
            </div>

            <button
              onClick={() => navigate('/syllabus-overview')}
              disabled={!hasProcessedSyllabus}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span>Continue to Syllabus Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Extraction Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Drop Zone & Add Buttons */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="bg-white border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-3xl p-8 text-center transition-all shadow-2xs space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto font-bold shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Drag & Drop Syllabus PDF files here</h2>
              <p className="text-xs text-slate-500 mt-1">Supports multiple subject PDFs (e.g. Data Structures.pdf, Java.pdf, DBMS.pdf)</p>
            </div>

            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              id="multi-syllabus-input"
              className="hidden"
            />

            <label
              htmlFor="multi-syllabus-input"
              className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Syllabus PDF</span>
            </label>
          </div>

          {/* Staged Pending Files to Upload */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-3xl border border-brand-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ready to Upload & Extract ({selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''})
                </h3>
                <button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      <span>Upload & Process Selected PDFs</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-xs">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-slate-800">{file.name}</span>
                      <span className="text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button
                      onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Syllabi Cards List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Uploaded Syllabus PDFs ({syllabi.length})</h2>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : syllabi.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Syllabus PDFs Uploaded Yet</p>
                <p className="text-xs text-slate-500">
                  Click "+ Add Syllabus PDF" above to upload your subject PDFs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {syllabi.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-extrabold text-slate-900">{item.file_name}</h3>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              item.status === 'PROCESSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status === 'PROCESSED' ? 'Processed ✓' : item.status === 'FAILED' ? 'Failed ✕' : 'Processing'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 mt-1">
                          Subject:{' '}
                          <span className="font-bold text-brand-700">
                            {item.subject_name || item.subjects?.[0]?.name || 'General Subject'}
                          </span>{' '}
                          • {item.subjects?.reduce((acc, sub) => acc + sub.modules.reduce((mAcc, mod) => mAcc + mod.topics.length, 0), 0) || 0} extracted topics
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => navigate('/syllabus-overview')}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        View & Edit
                      </button>
                      {item.status === 'FAILED' && (
                        <button
                          onClick={() => handleReprocessSyllabus(item.id)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSyllabus(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
