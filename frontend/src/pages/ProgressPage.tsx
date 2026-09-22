import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, CheckCircle2, AlertTriangle, Clock, Flame } from 'lucide-react';
import api from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ProgressData } from '../types';

export const ProgressPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress');
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Progress Tracking</h1>
              <p className="text-sm text-slate-500 mt-1">
                Real database analytics tracking overall, subject, and topic level completion
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !progress ? (
            <p className="text-xs text-slate-400 text-center">No progress data available.</p>
          ) : (
            <div className="space-y-6">
              {/* Overall Progress Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-400">Total Completion</span>
                  <h2 className="text-4xl font-extrabold text-slate-900">{progress.overallPercentage}% Completed</h2>
                  <p className="text-xs text-slate-500">
                    {progress.completedTopicsCount} of {progress.totalTopics} syllabus topics marked as completed
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-2">
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{ width: `${progress.overallPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Completed Sessions</span>
                  <p className="text-2xl font-extrabold text-emerald-600">{progress.sessionStats?.completedSessions || 0}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Missed & Rescheduled</span>
                  <p className="text-2xl font-extrabold text-amber-600">{progress.sessionStats?.missedSessions || 0}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Pending Topics</span>
                  <p className="text-2xl font-extrabold text-slate-900">{progress.pendingTopicsCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Study Streak</span>
                  <p className="text-2xl font-extrabold text-orange-500">{progress.streak} Days</p>
                </div>
              </div>

              {/* Subject Breakdown List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900">Subject Level Progress</h2>

                {progress.subjectProgress.length === 0 ? (
                  <p className="text-xs text-slate-400">No subjects found in uploaded syllabus.</p>
                ) : (
                  <div className="space-y-4">
                    {progress.subjectProgress.map((sub) => (
                      <div key={sub.subjectId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-slate-900">{sub.subjectName}</h3>
                          <span className="text-sm font-extrabold text-brand-600">{sub.percentage}%</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {sub.completedTopics} of {sub.totalTopics} topics completed
                        </p>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
