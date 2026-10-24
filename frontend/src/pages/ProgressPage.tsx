import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
} from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ProgressData } from '../types';

export const ProgressPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await api.get('/progress');
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load progress', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Progress Tracking
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track overall, subject, and topic-level completion
              </p>
            </div>

            <button
              type="button"
              onClick={fetchProgress}
              disabled={loading}
              className="self-start px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh Progress'}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Loading your progress...
              </p>
            </div>
          ) : error || !progress ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {error
                  ? 'Unable to load progress data.'
                  : 'No progress data available.'}
              </p>
              {error && (
                <button
                  type="button"
                  onClick={fetchProgress}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Progress */}
              <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-200">
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500">
                    Total Completion
                  </span>

                  <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {progress.overallPercentage}% Completed
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {progress.completedTopicsCount} of {progress.totalTopics}{' '}
                    syllabus topics completed
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-2">
                  <div
                    className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700"
                    role="progressbar"
                    aria-valuenow={progress.overallPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Overall syllabus completion"
                  >
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(0, progress.overallPercentage))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Completed Sessions
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {progress.sessionStats?.completedSessions || 0}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Missed Sessions
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  </div>
                  <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                    {progress.sessionStats?.missedSessions || 0}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Pending Topics
                    </span>
                    <BookOpen className="w-5 h-5 text-brand-500 shrink-0" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {progress.pendingTopicsCount}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Study Streak
                    </span>
                    <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                  </div>
                  <p className="text-2xl font-extrabold text-orange-500">
                    {progress.streak} Days
                  </p>
                </div>
              </section>

              {/* Subject Progress */}
              <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Subject Level Progress
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Completion breakdown for each subject
                    </p>
                  </div>
                </div>

                {progress.subjectProgress.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
                    No subjects found in uploaded syllabus.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {progress.subjectProgress.map((sub) => (
                      <div
                        key={sub.subjectId}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {sub.subjectName}
                          </h3>
                          <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 shrink-0">
                            {sub.percentage}%
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {sub.completedTopics} of {sub.totalTopics} topics
                          completed
                        </p>

                        <div
                          className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={sub.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${sub.subjectName} completion`}
                        >
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, sub.percentage))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
