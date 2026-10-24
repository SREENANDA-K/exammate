import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Exam, Syllabus } from '../types';

export const ExamsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);

      const [examsRes, syllabiRes] = await Promise.all([
        api.get('/exams'),
        api.get('/syllabus'),
      ]);

      setExams(examsRes.data.exams || []);

      const loadedSyllabi: Syllabus[] = syllabiRes.data.syllabi || [];
      setSyllabi(loadedSyllabi);

      const subjects = loadedSyllabi.flatMap((syllabus) => syllabus.subjects || []);

      if (subjects.length > 0) {
        setSelectedSubjectId((current) =>
          subjects.some((subject) => subject.id === current)
            ? current
            : subjects[0].id
        );
      } else {
        setSelectedSubjectId('');
      }
    } catch (err) {
      console.error('Failed to load exams', err);
      setMessage('Unable to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubjectId || !examDate) {
      setMessage('Please select a subject and exam date.');
      return;
    }

    try {
      setMessage(null);

      await api.post('/exams', {
        subject_id: selectedSubjectId,
        exam_date: examDate,
      });

      setMessage('Exam scheduled successfully.');
      setExamDate('');
      await fetchExams();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error scheduling exam.');
    }
  };

  const handleDeleteExam = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this exam?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/exams/${id}`);
      setMessage('Exam deleted successfully.');
      await fetchExams();
    } catch (err) {
      console.error('Error deleting exam', err);
      setMessage('Unable to delete the exam. Please try again.');
    }
  };

  const allSubjects = syllabi.flatMap((syllabus) => syllabus.subjects || []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
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
                Upcoming Exams
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage exam dates to trigger Exam Preparation Mode
              </p>
            </div>
          </div>

          {message && (
            <div
              role="status"
              className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm font-semibold"
            >
              {message}
            </div>
          )}

          {/* Add Exam Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-200">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Add New Upcoming Exam
            </h2>

            {allSubjects.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please upload a syllabus to add exams for extracted subjects.
              </p>
            ) : (
              <form
                onSubmit={handleAddExam}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    Subject
                  </label>

                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  >
                    {allSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    Exam Date
                  </label>

                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toLocaleDateString('en-CA')}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Exam</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* List of Exams */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-200">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Scheduled Exams ({exams.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                  Loading exams...
                </p>
              </div>
            ) : exams.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                No upcoming exams scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => {
                  const examD = new Date(exam.exam_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const examDay = new Date(examD);
                  examDay.setHours(0, 0, 0, 0);

                  const diffDays = Math.ceil(
                    (examDay.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={exam.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold">
                          <GraduationCap className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {exam.subject.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Exam Date:{' '}
                            {examD.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-xs font-bold px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-xl whitespace-nowrap">
                          {diffDays > 1
                            ? `${diffDays} Days Left`
                            : diffDays === 1
                              ? '1 Day Left'
                              : diffDays === 0
                                ? 'Exam Today'
                                : 'Exam Passed'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteExam(exam.id)}
                          aria-label={`Delete exam for ${exam.subject.name}`}
                          title="Delete exam"
                          className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
