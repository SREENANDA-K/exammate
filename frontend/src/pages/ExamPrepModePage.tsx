import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Zap,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Exam, StudySession, Syllabus } from '../types';

export const ExamPrepModePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [prepSessions, setPrepSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // New exam form state
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const fetchExamPrepData = async () => {
    try {
      setLoading(true);

      const [examsRes, syllabiRes, timetableRes] = await Promise.all([
        api.get('/exams'),
        api.get('/syllabus'),
        api.get('/timetable', { params: { mode: 'EXAM_PREP' } }),
      ]);

      const fetchedExams = examsRes.data.exams || [];
      const fetchedSyllabi = syllabiRes.data.syllabi || [];
      const fetchedSessions = timetableRes.data.sessions || [];

      setExams(fetchedExams);
      setSyllabi(fetchedSyllabi);
      setPrepSessions(fetchedSessions);

      const allFetchedSubjects = fetchedSyllabi.flatMap(
        (syllabus: Syllabus) => syllabus.subjects || []
      );

      if (allFetchedSubjects.length > 0) {
        setSelectedSubjectId((currentId) => {
          if (allFetchedSubjects.some((subject: any) => subject.id === currentId)) {
            return currentId;
          }

          return allFetchedSubjects[0].id;
        });
      } else {
        setSelectedSubjectId('');
      }
    } catch (err) {
      console.error('Failed to fetch exam prep data', err);
      setMessage('Unable to load exam preparation data. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamPrepData();
  }, []);

  const handleCreateExamAndPrep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubjectId || !examDate) {
      setMessage('Please select a subject and exam date.');
      setMessageType('error');
      return;
    }

    try {
      setGenerating(true);
      setMessage(null);

      await api.post('/exams', {
        subject_id: selectedSubjectId,
        exam_date: examDate,
      });

      setMessage('Exam added and the Exam Prep schedule request was submitted.');
      setMessageType('success');

      await fetchExamPrepData();
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || 'Error scheduling exam prep.'
      );
      setMessageType('error');
    } finally {
      setGenerating(false);
    }
  };

  // Generate or regenerate the schedule for an existing exam.
  const handleManualTrigger = async (examId: string) => {
    try {
      setGenerating(true);
      setActiveExamId(examId);
      setMessage(null);

      const res = await api.post('/exams/prep-mode/generate', {
        exam_id: examId,
      });

      setMessage(res.data.message || 'Exam prep schedule generated successfully.');
      setMessageType('success');

      await fetchExamPrepData();
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || 'Error generating the exam prep schedule.'
      );
      setMessageType('error');
    } finally {
      setGenerating(false);
      setActiveExamId(null);
    }
  };

  const allSubjects = syllabi.flatMap((syllabus) => syllabus.subjects || []);

  // Support common exam response field names without changing the API.
  const getExamDetails = (exam: Exam) => {
    const item = exam as any;

    const subjectName =
      item.subject?.name ||
      item.subject_name ||
      item.subjectName ||
      item.subject?.subject_name ||
      'Scheduled exam';

    const rawDate =
      item.exam_date ||
      item.examDate ||
      item.date;

    let formattedDate = 'Date not available';

    if (rawDate) {
      const parsedDate = new Date(rawDate);

      formattedDate = Number.isNaN(parsedDate.getTime())
        ? String(rawDate)
        : parsedDate.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
    }

    return { subjectName, formattedDate };
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Page heading */}
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Targeted Revision Mode</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Exam Preparation Mode
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate intensive revision and practice sessions for your
              upcoming exams without changing your regular study timetable.
            </p>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              role="status"
              className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
                messageType === 'error'
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Add exam form */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6 transition-colors">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Schedule an Exam
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add an exam to your list and request its preparation schedule.
              </p>
            </div>

            {allSubjects.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                Please upload a syllabus first to select subjects for exam
                preparation.
              </div>
            ) : (
              <form
                onSubmit={handleCreateExamAndPrep}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <label
                    htmlFor="examSubject"
                    className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    Exam Subject
                  </label>

                  <select
                    id="examSubject"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    {allSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="examDate"
                    className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    Exam Date
                  </label>

                  <input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={generating || !selectedSubjectId || !examDate}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating && activeExamId === null ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Add Exam</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Existing exams with generate/regenerate actions */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Scheduled Exams ({exams.length})
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Generate or regenerate a preparation schedule for an exam.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchExamPrepData}
                disabled={loading || generating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                  Loading exams...
                </p>
              </div>
            ) : exams.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No Exams Scheduled
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add an exam using the form above. It will appear here once
                  the backend saves it successfully.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => {
                  const { subjectName, formattedDate } = getExamDetails(exam);
                  const examId = String((exam as any).id);

                  return (
                    <div
                      key={examId}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {subjectName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Exam date: {formattedDate}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleManualTrigger(examId)}
                        disabled={generating || !examId || examId === 'undefined'}
                        className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white text-sm font-extrabold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating && activeExamId === examId ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>Generate / Regenerate Prep</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Generated exam prep sessions */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-4 transition-colors">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Active Exam Prep Sessions ({prepSessions.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : prepSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No Exam Prep Sessions Active
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add an upcoming exam and generate its preparation schedule
                  to see revision sessions here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prepSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                        {session.start_time}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {session.topic.name}
                          </h3>

                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200">
                            Intensive Revision
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {session.topic.module.subject.name} •{' '}
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`self-start sm:self-auto shrink-0 text-xs font-bold px-3 py-1 rounded-xl ${
                        session.status === 'COMPLETED'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : session.status === 'MISSED'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};