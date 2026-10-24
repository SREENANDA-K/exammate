import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
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
      await fetchTimetable();
    } catch (err) {
      console.error('Error completing session', err);
    }
  };

  const handleMarkMissed = async (sessionId: string) => {
    try {
      await api.post(`/timetable/${sessionId}/miss`);
      await fetchTimetable();
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

  // Filter sessions matching the selected date window
  const selectedDateStr = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0'),
  ].join('-');

  const getFilteredSessions = () => {
    if (viewMode === 'daily') {
      return sessions.filter((s) => s.date.startsWith(selectedDateStr));
    }

    // Weekly view: Monday through Sunday
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

  const filterButtonClass = (active: boolean, activeClass: string) =>
    `rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
      active
        ? activeClass
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-slate-950">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Study Timetable
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your personalized daily and weekly study sessions generated from your syllabus
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Study mode filter */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setModeFilter('ALL')}
                  className={filterButtonClass(
                    modeFilter === 'ALL',
                    'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  )}
                >
                  All Modes
                </button>

                <button
                  type="button"
                  onClick={() => setModeFilter('REGULAR')}
                  className={filterButtonClass(
                    modeFilter === 'REGULAR',
                    'bg-brand-500 text-white'
                  )}
                >
                  Regular
                </button>

                <button
                  type="button"
                  onClick={() => setModeFilter('EXAM_PREP')}
                  className={filterButtonClass(
                    modeFilter === 'EXAM_PREP',
                    'bg-purple-600 text-white'
                  )}
                >
                  Exam Prep
                </button>
              </div>

              {/* Daily / weekly view switch */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setViewMode('daily')}
                  className={filterButtonClass(
                    viewMode === 'daily',
                    'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-orange-300'
                  )}
                >
                  Daily
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('weekly')}
                  className={filterButtonClass(
                    viewMode === 'weekly',
                    'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-orange-300'
                  )}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Date navigator */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handlePrevDate}
              aria-label="Previous date range"
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {viewMode === 'daily'
                  ? 'Single Day View'
                  : '7-Day Schedule Window'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextDate}
              aria-label="Next date range"
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Sessions */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Loading your timetable...
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                No Study Sessions Found
              </h3>

              <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
                No sessions are scheduled for this period with the current filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const isCompleted = session.status === 'COMPLETED';
                const isMissed = session.status === 'MISSED';
                const isExamPrep = session.mode === 'EXAM_PREP';

                return (
                  <div
                    key={session.id}
                    className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm transition-colors md:flex-row md:items-center ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30'
                        : isMissed
                        ? 'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30'
                        : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl text-xs font-bold ${
                          isExamPrep
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-orange-300'
                        }`}
                      >
                        <span>{session.start_time}</span>
                        <span className="text-[10px] opacity-75">
                          {session.end_time}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {session.topic.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              isExamPrep
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                            }`}
                          >
                            {isExamPrep
                              ? 'Exam Prep Mode'
                              : 'Regular Study Mode'}
                          </span>

                          {session.rescheduled_from_id && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                              Auto Rescheduled
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Subject:{' '}
                          <span className="text-slate-800 dark:text-slate-200">
                            {session.topic.module.subject.name}
                          </span>
                          {' • '}Date:{' '}
                          {new Date(session.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Session actions and status */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {session.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkComplete(session.id)}
                            className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Complete</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkMissed(session.id)}
                            className="flex items-center space-x-1 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-amber-100 hover:text-amber-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-amber-500/20 dark:hover:text-amber-300"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Mark Missed</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <span className="flex items-center space-x-1.5 rounded-xl bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Completed</span>
                        </span>
                      )}

                      {isMissed && (
                        <span className="flex items-center space-x-1.5 rounded-xl bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span>Missed &amp; Rescheduled</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};