
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileUp,
  FileText,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  Plus,
  Trash2,
  RefreshCw,
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
      const validFiles = newFiles.filter((file) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          setError('Only PDF files are supported.');
          return false;
        }

        if (file.size > 15 * 1024 * 1024) {
          setError('Each PDF file size must be less than 15MB.');
          return false;
        }

        return true;
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);

      // Allow selecting the same file again after removing it.
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((file) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          setError('Only PDF files are supported.');
          return false;
        }

        if (file.size > 15 * 1024 * 1024) {
          setError('Each PDF file size must be less than 15MB.');
          return false;
        }

        return true;
      });

      if (validFiles.length === 0 && !error) {
        setError('Please drop valid PDF files.');
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
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
      setError(
        err.response?.data?.message ||
          'Failed to process syllabus files.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSyllabus = async (id: string) => {
    try {
      await api.delete(`/syllabus/${id}`);
      await fetchSyllabi();
    } catch (err) {
      console.error('Failed to delete syllabus', err);
    }
  };

  const handleReprocessSyllabus = async (
    id: string,
    customSubjectName?: string
  ) => {
    try {
      await api.post(`/syllabus/${id}/process`, {
        subject_name: customSubjectName,
      });
      await fetchSyllabi();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to reprocess file.'
      );
    }
  };

  const hasProcessedSyllabus = syllabi.some(
    (syllabus) => syllabus.status === 'PROCESSED'
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-slate-950">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 lg:p-8">
          {/* Page header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Build Your Syllabus
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Upload your syllabus PDFs. You can upload one complete
                syllabus or separate PDFs for individual subjects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/syllabus-overview')}
              disabled={!hasProcessedSyllabus}
              className="flex shrink-0 items-center justify-center space-x-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Continue to Syllabus Review</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex items-start space-x-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />

              <div>
                <p className="font-bold">Extraction Notice</p>
                <p className="mt-0.5 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* PDF upload drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="space-y-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center shadow-sm transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 shadow-sm dark:bg-brand-500/15">
              <UploadCloud className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Drag &amp; Drop Syllabus PDF files here
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Supports multiple subject PDFs (e.g. Data Structures.pdf,
                Java.pdf, DBMS.pdf)
              </p>
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
              className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Syllabus PDF</span>
            </label>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              PDF format only · Maximum 15MB per file
            </p>
          </div>

          {/* Files waiting to upload */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4 rounded-3xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-500/30 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Ready to Upload &amp; Extract ({selectedFiles.length}{' '}
                  File{selectedFiles.length > 1 ? 's' : ''})
                </h3>

                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-brand-600 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <FileUp className="h-4 w-4" />
                      <span>Upload &amp; Process PDFs</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <div className="flex min-w-0 items-center space-x-3">
                      <FileText className="h-4 w-4 shrink-0 text-brand-600 dark:text-orange-400" />

                      <span className="truncate font-bold text-slate-800 dark:text-slate-100">
                        {file.name}
                      </span>

                      <span className="shrink-0 text-slate-400 dark:text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={uploading}
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="shrink-0 p-1 text-slate-400 transition-colors hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded syllabi */}
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-8">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Uploaded Syllabus PDFs ({syllabi.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Loading syllabi...
                </p>
              </div>
            ) : syllabi.length === 0 ? (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />

                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No Syllabus PDFs Uploaded Yet
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click "Add Syllabus PDF" above to upload your subject PDFs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {syllabi.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-700 dark:bg-slate-800/60 md:flex-row md:items-center"
                  >
                    <div className="flex min-w-0 items-start space-x-3.5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-orange-300">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-sm font-extrabold text-slate-900 dark:text-white">
                            {item.file_name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              item.status === 'PROCESSED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : item.status === 'FAILED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                            }`}
                          >
                            {item.status === 'PROCESSED'
                              ? 'Processed ✓'
                              : item.status === 'FAILED'
                              ? 'Failed ✕'
                              : 'Processing'}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Subject:{' '}
                          <span className="font-bold text-brand-700 dark:text-orange-400">
                            {item.subject_name ||
                              item.subjects?.[0]?.name ||
                              'General Subject'}
                          </span>
                          {' • '}
                          {item.subjects?.reduce(
                            (total, subject) =>
                              total +
                              subject.modules.reduce(
                                (moduleTotal, module) =>
                                  moduleTotal + module.topics.length,
                                0
                              ),
                            0
                          ) || 0}{' '}
                          extracted topics
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/syllabus-overview')}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        View &amp; Edit
                      </button>

                      {item.status === 'FAILED' && (
                        <button
                          type="button"
                          onClick={() => handleReprocessSyllabus(item.id)}
                          className="flex items-center space-x-1 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-600"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Retry</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteSyllabus(item.id)}
                        aria-label={`Delete ${item.file_name}`}
                        className="p-1.5 text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
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