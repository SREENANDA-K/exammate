
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PlusCircle,
  FileText,
  Layers,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ProgressData, StudySession, Exam } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [progressRes, timetableRes, examsRes] = await Promise.all([
        api.get('/progress'),
        api.get('/timetable'),
        api.get('/exams'),
      ]);

      setProgress(progressRes.data);

      const allSessions: StudySession[] = timetableRes.data.sessions || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const todayList = allSessions.filter((s) =>
        s.date.startsWith(todayStr)
      );

      setTodaySessions(todayList);
      setUpcomingExams(examsRes.data.exams || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkComplete = async (sessionId: string) => {
    try {
      await api.post(`/timetable/${sessionId}/complete`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  };

  const handleMarkMissed = async (sessionId: string) => {
    try {
      await api.post(`/timetable/${sessionId}/miss`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to miss session', err);
    }
  };

  const nextExam = upcomingExams[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Multi-Syllabus Adaptive Planner</span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>

              <p className="text-slate-300 text-sm max-w-xl">
                {user?.profile?.course
                  ? `${user.profile.course} (${user.profile.qualification})`
                  : 'Student Plan'}{' '}
                • {user?.profile?.daily_study_hours || 3} Hours Daily Target
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 flex-wrap">
              <Link
                to="/syllabus-upload"
                className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>+ Add Syllabus</span>
              </Link>

              <Link
                to="/regular-study"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur transition-all flex items-center space-x-2 border border-white/20"
              >
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Regular Timetable</span>
              </Link>
            </div>
          </div>

          {/* Syllabus Coverage Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-400">
                  Processed PDFs
                </span>
                <FileText className="w-4 h-4 text-brand-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {progress?.processedPdfCount || 0}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Uploaded syllabus files
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-400">
                  Total Subjects
                </span>
                <Layers className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {progress?.totalSubjectsCount || 0}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Academic courses
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-400">
                  Total Topics
                </span>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {progress?.totalTopics || 0}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Confirmed syllabus topics
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-400">
                  Overall Progress
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {progress?.overallPercentage || 0}%
              </p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${progress?.overallPercentage || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              to="/syllabus-upload"
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
            >
              <FileText className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Build Syllabus
              </span>
            </Link>

            <Link
              to="/timetable"
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
            >
              <Calendar className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                View Timetable
              </span>
            </Link>

            <Link
              to="/exam-prep"
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
            >
              <GraduationCap className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Exam Preparation
              </span>
            </Link>

            <Link
              to="/progress"
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
            >
              <TrendingUp className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Progress
              </span>
            </Link>

            <Link
              to="/exams"
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group col-span-2 sm:col-span-1"
            >
              <PlusCircle className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Exams
              </span>
            </Link>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Study Sessions */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    Today's Study Schedule
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real study sessions mapped across all your subjects
                  </p>
                </div>

                <Link
                  to="/timetable"
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center shrink-0"
                >
                  <span>Full Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              {todaySessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No study sessions scheduled for today
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Generate your timetable from your syllabus PDFs to populate your daily schedule.
                  </p>
                  <Link
                    to="/syllabus-overview"
                    className="inline-flex items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Generate Timetable
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        session.status === 'COMPLETED'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                          : session.status === 'MISSED'
                          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${
                            session.mode === 'EXAM_PREP'
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                              : 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                          }`}
                        >
                          {session.start_time}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {session.topic.name}
                            </h3>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                session.mode === 'EXAM_PREP'
                                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {session.mode === 'EXAM_PREP' ? 'Exam Prep' : 'Regular'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {session.topic.module.subject.name} • {session.start_time} – {session.end_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 shrink-0">
                        {session.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMarkComplete(session.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkMissed(session.id)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-600 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 font-bold text-xs rounded-xl transition-colors"
                            >
                              Missed
                            </button>
                          </>
                        )}

                        {session.status === 'COMPLETED' && (
                          <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </span>
                        )}

                        {session.status === 'MISSED' && (
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-xl">
                            Rescheduled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Exam and Subject Progress */}
            <div className="space-y-6">
              {/* Upcoming Exam */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Upcoming Exam
                  </h2>
                  <Link
                    to="/exams"
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                {nextExam ? (
                  <div className="p-4 rounded-2xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 space-y-3 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                        <GraduationCap className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {nextExam.subject.name}
                        </h3>
                        <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                          Date:{' '}
                          {new Date(nextExam.exam_date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/exam-prep"
                      className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Open Exam Prep Mode</span>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                    <GraduationCap className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      No Exams Scheduled
                    </p>
                    <Link
                      to="/exams"
                      className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline block"
                    >
                      + Add Exam Date
                    </Link>
                  </div>
                )}
              </div>

              {/* Subject Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Syllabus Subjects
                  </h2>
                  <span className="text-xs font-bold text-slate-400">
                    {progress?.subjectProgress?.length || 0} Subjects
                  </span>
                </div>

                {progress?.subjectProgress && progress.subjectProgress.length > 0 ? (
                  <div className="space-y-3">
                    {progress.subjectProgress.map((sub) => (
                      <div
                        key={sub.subjectId}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">
                            {sub.subjectName}
                          </span>
                          <span className="font-bold text-brand-600 dark:text-brand-400 shrink-0">
                            {sub.totalTopics} topics
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all"
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No subject topics added yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};