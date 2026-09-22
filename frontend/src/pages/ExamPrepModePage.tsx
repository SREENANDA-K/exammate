import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar, Zap, CheckCircle2, Clock, Plus, AlertCircle } from 'lucide-react';
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

  // New exam form state
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchExamPrepData = async () => {
    try {
      setLoading(true);
      const [examsRes, syllabiRes, timetableRes] = await Promise.all([
        api.get('/exams'),
        api.get('/syllabus'),
        api.get('/timetable', { params: { mode: 'EXAM_PREP' } }),
      ]);

      setExams(examsRes.data.exams || []);
      setSyllabi(syllabiRes.data.syllabi || []);
      setPrepSessions(timetableRes.data.sessions || []);

      if (syllabiRes.data.syllabi.length > 0 && syllabiRes.data.syllabi[0].subjects.length > 0) {
        setSelectedSubjectId(syllabiRes.data.syllabi[0].subjects[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch exam prep data', err);
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
      return;
    }

    try {
      setGenerating(true);
      setMessage(null);
      await api.post('/exams', {
        subject_id: selectedSubjectId,
        exam_date: examDate,
      });
      setMessage('Exam added and 1-week Exam Prep schedule generated!');
      fetchExamPrepData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error scheduling exam prep.');
    } finally {
      setGenerating(false);
    }
  };

  const handleManualTrigger = async (examId: string) => {
    try {
      setGenerating(true);
      setMessage(null);
      const res = await api.post('/exams/prep-mode/generate', { exam_id: examId });
      setMessage(res.data.message || 'Exam prep schedule generated.');
      fetchExamPrepData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error triggering prep mode.');
    } finally {
      setGenerating(false);
    }
  };

  const allSubjects = syllabi.flatMap((s) => s.subjects);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>Targeted Revision Mode</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Exam Preparation Mode</h1>
              <p className="text-sm text-slate-500 mt-1">
                Generates intensive revision and practice sessions ~1 week before your upcoming exam without touching your regular study timetable.
              </p>
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Add Exam Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Schedule Exam & Activate Prep Schedule</h2>

            {allSubjects.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                Please upload a syllabus first to select subjects for exam preparation.
              </div>
            ) : (
              <form onSubmit={handleCreateExamAndPrep} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Exam Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    {allSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    required
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Activate Exam Prep Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Generated Exam Prep Sessions */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Active Exam Prep Sessions ({prepSessions.length})</h2>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : prepSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-sm font-bold text-slate-700">No Exam Prep Sessions Active</p>
                <p className="text-xs text-slate-500">
                  Schedule an upcoming exam date above to generate targeted revision sessions leading up to the exam.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prepSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        {session.start_time}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900">{session.topic.name}</h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                            Intensive Revision
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {session.topic.module.subject.name} • {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl ${
                        session.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {session.status}
                    </span>
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
