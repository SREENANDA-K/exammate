
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Calendar,
  ArrowRight,
  FileText,
} from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Syllabus } from '../types';

export const SyllabusReviewPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchAllSyllabi = async () => {
    try {
      setLoading(true);
      const res = await api.get('/syllabus');
      setSyllabi(res.data.syllabi || []);
    } catch (err) {
      console.error('Failed to load syllabi', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSyllabi();
  }, []);

  const handleTopicNameChange = (
    sylIdx: number,
    subIdx: number,
    modIdx: number,
    topIdx: number,
    newName: string
  ) => {
    const updated = JSON.parse(JSON.stringify(syllabi));
    updated[sylIdx].subjects[subIdx].modules[modIdx].topics[topIdx].name = newName;
    setSyllabi(updated);
  };

  const handleAddTopic = (sylIdx: number, subIdx: number, modIdx: number) => {
    const updated = JSON.parse(JSON.stringify(syllabi));
    updated[sylIdx].subjects[subIdx].modules[modIdx].topics.push({
      id: `new-${Date.now()}`,
      name: 'New Custom Topic',
      status: 'PENDING',
    });
    setSyllabi(updated);
  };

  const handleRemoveTopic = (
    sylIdx: number,
    subIdx: number,
    modIdx: number,
    topIdx: number
  ) => {
    const updated = JSON.parse(JSON.stringify(syllabi));
    updated[sylIdx].subjects[subIdx].modules[modIdx].topics.splice(topIdx, 1);
    setSyllabi(updated);
  };

  const handleSubjectNameChange = (
    sylIdx: number,
    subIdx: number,
    newName: string
  ) => {
    const updated = JSON.parse(JSON.stringify(syllabi));
    updated[sylIdx].subjects[subIdx].name = newName;
    setSyllabi(updated);
  };

  const handleDeleteSyllabus = async (id: string) => {
    try {
      await api.delete(`/syllabus/${id}`);
      await fetchAllSyllabi();
    } catch (err) {
      console.error('Failed to delete syllabus file', err);
      setMessage('Failed to delete syllabus PDF. Please try again.');
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setMessage(null);

      for (const syl of syllabi) {
        await api.put(`/syllabus/${syl.id}`, {
          subject_name: syl.subject_name,
          subjects: syl.subjects,
        });
      }

      setMessage('All subject structures saved successfully.');
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || 'Error saving syllabus updates.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateTimetable = async () => {
    try {
      setGenerating(true);
      setMessage(null);

      // Save all structure updates before generating the timetable.
      for (const syl of syllabi) {
        await api.put(`/syllabus/${syl.id}`, {
          subject_name: syl.subject_name,
          subjects: syl.subjects,
        });
      }

      await api.post('/timetable/generate');
      navigate('/timetable');
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || 'Failed to generate timetable.'
      );
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const totalExtractedTopics = syllabi.reduce(
    (acc, syl) =>
      acc +
      syl.subjects.reduce(
        (sAcc, sub) =>
          sAcc +
          sub.modules.reduce((mAcc, mod) => mAcc + mod.topics.length, 0),
        0
      ),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Review Your Syllabus
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review and edit subjects and topics extracted from all your
                uploaded syllabus PDFs before generating your timetable.
              </p>
            </div>

            {syllabi.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Structure'}</span>
                </button>

                <button
                  onClick={handleGenerateTimetable}
                  disabled={generating || totalExtractedTopics === 0}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-2 disabled:opacity-40"
                >
                  {generating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirm &amp; Generate Timetable</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              role="status"
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {syllabi.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                No Syllabus PDFs Uploaded
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please upload your syllabus PDF files first to extract subjects
                and build your timetable.
              </p>
              <button
                onClick={() => navigate('/syllabus-upload')}
                className="px-6 py-3 bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md hover:bg-brand-600 transition-all inline-flex items-center space-x-2"
              >
                <span>Upload Syllabus PDFs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {syllabi.map((syl, sylIdx) => (
                <div
                  key={syl.id || sylIdx}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors"
                >
                  {/* File header */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium break-all">
                          Source: {syl.file_name}
                        </p>
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white break-words">
                          {syl.subject_name ||
                            syl.subjects?.[0]?.name ||
                            'Syllabus Subject'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSyllabus(syl.id)}
                      className="p-2 shrink-0 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete this syllabus PDF"
                      aria-label="Delete this syllabus PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subjects and modules */}
                  <div className="space-y-6">
                    {syl.subjects.map((subject, subIdx) => (
                      <div key={subject.id || subIdx} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            aria-label="Subject name"
                            value={subject.name}
                            onChange={(e) =>
                              handleSubjectNameChange(
                                sylIdx,
                                subIdx,
                                e.target.value
                              )
                            }
                            className="w-full max-w-full text-base font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-brand-500 focus:outline-none px-1 py-1"
                          />
                        </div>

                        {subject.modules.map((mod, modIdx) => (
                          <div
                            key={mod.id || modIdx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                {mod.name}
                              </span>

                              <button
                                onClick={() =>
                                  handleAddTopic(sylIdx, subIdx, modIdx)
                                }
                                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center space-x-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Topic</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {mod.topics.map((topic, topIdx) => (
                                <div
                                  key={topic.id || topIdx}
                                  className="flex items-center justify-between min-w-0 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                                >
                                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    <span className="text-emerald-500 dark:text-emerald-400 font-bold text-xs">
                                      ✓
                                    </span>
                                    <input
                                      type="text"
                                      aria-label="Topic name"
                                      value={topic.name}
                                      onChange={(e) =>
                                        handleTopicNameChange(
                                          sylIdx,
                                          subIdx,
                                          modIdx,
                                          topIdx,
                                          e.target.value
                                        )
                                      }
                                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent w-full min-w-0 focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-sm"
                                    />
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleRemoveTopic(
                                        sylIdx,
                                        subIdx,
                                        modIdx,
                                        topIdx
                                      )
                                    }
                                    className="p-1 shrink-0 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2"
                                    title="Remove topic"
                                    aria-label={`Remove topic ${topic.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
