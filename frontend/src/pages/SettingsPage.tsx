import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  GraduationCap,
  Building,
  BookOpen,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const SettingsPage: React.FC = () => {
  const { user, updateProfileData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [qualification, setQualification] = useState('BTech');
  const [course, setCourse] = useState('Computer Science');
  const [institution, setInstitution] = useState('');
  const [dailyHours, setDailyHours] = useState('3.0');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setQualification(user.profile.qualification || 'BTech');
      setCourse(user.profile.course || 'Computer Science');
      setInstitution(user.profile.institution || '');
      setDailyHours(user.profile.daily_study_hours?.toString() || '3.0');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hours = parseFloat(dailyHours);

    if (!Number.isFinite(hours) || hours < 1 || hours > 6) {
      setMessage('Please select valid daily study hours.');
      setSaveSuccess(false);
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      setSaveSuccess(false);

      await updateProfileData({
        qualification: qualification.trim(),
        course: course.trim(),
        institution: institution.trim(),
        daily_study_hours: hours,
      });

      setMessage('Settings updated successfully.');
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to update settings', err);
      setMessage('Failed to update settings. Please try again.');
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors';

  const labelClass =
    'block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Student Settings
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage academic preferences and daily study capacity
              </p>
            </div>
          </div>

          {message && (
            <div
              role="status"
              className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
                saveSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}
            >
              {saveSuccess ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Account & Profile Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Personal account details and academic preferences
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>User Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className={`${inputClass} bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed`}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`${inputClass} bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Qualification
                    </span>
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. BTech"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Course / Department
                    </span>
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Computer Science"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Institution
                  </span>
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={inputClass}
                  placeholder="Enter your college or institution"
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Daily Available Study Hours
                  </span>
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className={inputClass}
                >
                  <option value="1.0">1 Hour / Day</option>
                  <option value="2.0">2 Hours / Day</option>
                  <option value="3.0">3 Hours / Day</option>
                  <option value="4.0">4 Hours / Day</option>
                  <option value="5.0">5 Hours / Day</option>
                  <option value="6.0">6 Hours / Day</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Choose the time you can realistically dedicate to studying each day.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};
