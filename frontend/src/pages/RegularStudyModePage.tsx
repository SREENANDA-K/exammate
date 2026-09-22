import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { StudySession } from '../types';

export const RegularStudyModePage: React.FC = () => {
  const { user, updateProfileData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyHours, setDailyHours] = useState('3.0');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile) {
      setDailyHours(user.profile.daily_study_hours?.toString() || '3.0');
    }
    fetchRegularSessions();
  }, [user]);

  const fetchRegularSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timetable', { params: { mode: 'REGULAR' } });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load regular sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setMessage(null);
      // Update profile daily study hours first if changed
      await updateProfileData({ daily_study_hours: parseFloat(dailyHours) });
      const res = await api.post('/timetable/generate');
      setMessage(res.data.message || 'Regular timetable updated.');
      fetchRegularSessions();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error generating timetable.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span>Long-Term Syllabus Completion</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Regular Study Mode</h1>
              <p className="text-sm text-slate-500 mt-1">
                Systematically completes your entire syllabus topic-by-topic across your available daily study hours.
              </p>
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Configuration Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Regular Schedule Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
                  Daily Available Study Hours
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="1.0">1 Hour / Day (1 Session)</option>
                    <option value="2.0">2 Hours / Day (2 Sessions)</option>
                    <option value="3.0">3 Hours / Day (3 Sessions)</option>
                    <option value="4.0">4 Hours / Day (4 Sessions)</option>
                    <option value="5.0">5 Hours / Day (5 Sessions)</option>
                    <option value="6.0">6 Hours / Day (6 Sessions)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Topics are distributed evenly across open daily slots to ensure complete coverage.
                </p>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate Regular Timetable</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Active Regular Sessions */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Generated Regular Sessions ({sessions.length})</h2>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-sm font-bold text-slate-700">No Regular Study Sessions Generated</p>
                <p className="text-xs text-slate-500">
                  Click "Generate Regular Timetable" above to create your schedule from your syllabus.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 15).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        {session.start_time}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{session.topic.name}</h3>
                        <p className="text-xs text-slate-500">
                          {session.topic.module.subject.name} • {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl ${
                        session.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : session.status === 'MISSED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
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
