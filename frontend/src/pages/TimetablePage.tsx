import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { StudySession } from '../types';

export const TimetablePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'REGULAR' | 'EXAM_PREP'>('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (modeFilter !== 'ALL') {
        params.mode = modeFilter;
      }
      const res = await api.get('/timetable', { params });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch timetable', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [modeFilter]);

  const handleMarkComplete = async (sessionId: string) => {
    try {
      await api.post(`/timetable/${sessionId}/complete`);
      fetchTimetable();
    } catch (err) {
      console.error('Error completing session', err);
    }
  };

  const handleMarkMissed = async (sessionId: string) => {
    try {
      await api.post(`/timetable/${sessionId}/miss`);
      fetchTimetable();
    } catch (err) {
      console.error('Error marking session missed', err);
    }
  };

  // Date navigation helpers
  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (viewMode === 'daily' ? 1 : 7));
    setSelectedDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (viewMode === 'daily' ? 1 : 7));
    setSelectedDate(d);
  };

  // Filter sessions matching selected date window
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const getFilteredSessions = () => {
    if (viewMode === 'daily') {
      return sessions.filter((s) => s.date.startsWith(selectedDateStr));
    }
    // Weekly view: get 7 days around selectedDate
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= startOfWeek && d <= endOfWeek;
    });
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Study Timetable</h1>
              <p className="text-sm text-slate-500 mt-1">
                Your personalized daily and weekly study sessions generated from your syllabus
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter mode */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setModeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    modeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Modes
                </button>
                <button
                  onClick={() => setModeFilter('REGULAR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    modeFilter === 'REGULAR' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Regular
                </button>
                <button
                  onClick={() => setModeFilter('EXAM_PREP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    modeFilter === 'EXAM_PREP' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Exam Prep
                </button>
              </div>

              {/* View switch */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'daily' ? 'bg-brand-50 text-brand-600' : 'text-slate-600'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'weekly' ? 'bg-brand-50 text-brand-600' : 'text-slate-600'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Date Navigator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
            <button
              onClick={handlePrevDate}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-sm font-extrabold text-slate-900">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                {viewMode === 'daily' ? 'Single Day View' : '7-Day Schedule Window'}
              </p>
            </div>
            <button
              onClick={handleNextDate}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Sessions List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Study Sessions Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No sessions scheduled for this period with the current filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    session.status === 'COMPLETED'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : session.status === 'MISSED'
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                        session.mode === 'EXAM_PREP'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      <span>{session.start_time}</span>
                      <span className="text-[10px] opacity-75">{session.end_time}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{session.topic.name}</h3>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            session.mode === 'EXAM_PREP'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {session.mode === 'EXAM_PREP' ? 'Exam Prep Mode' : 'Regular Study Mode'}
                        </span>
                        {session.rescheduled_from_id && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Auto Rescheduled
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-500">
                        Subject: <span className="text-slate-800">{session.topic.module.subject.name}</span> • Date:{' '}
                        {new Date(session.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {session.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleMarkComplete(session.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Complete</span>
                        </button>
                        <button
                          onClick={() => handleMarkMissed(session.id)}
                          className="px-4 py-2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Mark Missed</span>
                        </button>
                      </>
                    )}

                    {session.status === 'COMPLETED' && (
                      <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}

                    {session.status === 'MISSED' && (
                      <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Missed & Rescheduled</span>
                      </span>
                    )}
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
