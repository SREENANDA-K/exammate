
import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Target,
  Sparkles,
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
      setDailyHours(
        String(user.profile.daily_study_hours ?? 3)
      );
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanQualification = qualification.trim();
    const cleanCourse = course.trim();
    const cleanInstitution = institution.trim();
    const hours = Number(dailyHours);

    if (!cleanQualification || !cleanCourse) {
      setMessage('Please enter your qualification and course.');
      setSaveSuccess(false);
      return;
    }

    if (!Number.isFinite(hours) || hours < 1 || hours > 6) {
      setMessage('Please choose between 1 and 6 study hours per day.');
      setSaveSuccess(false);
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      setSaveSuccess(false);

      await updateProfileData({
        qualification: cleanQualification,
        course: cleanCourse,
        institution: cleanInstitution,
        daily_study_hours: hours,
      });

      setMessage('Your student profile has been updated successfully.');
      setSaveSuccess(true);
    } catch (error) {
      console.error('Failed to update student profile:', error);
      setMessage('Unable to save your profile. Please try again.');
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-brand-400';

  const labelClass =
    'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200';

  const sectionClass =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900';

  const sectionTitleClass =
    'text-lg font-bold text-slate-900 dark:text-white';

  const sectionDescriptionClass =
    'mt-1 text-sm text-slate-500 dark:text-slate-400';

  const initials =
    user?.name?.trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Page heading */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <UserRound className="h-4 w-4" />
              My Account
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Profile
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage your academic information and personalize your
              ExamMate study plan.
            </p>
          </div>

          {/* Profile summary */}
          <section className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-5 sm:p-7 dark:border-brand-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-extrabold text-white shadow-sm">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  Your learning journey
                </p>

                <h2 className="mt-1 break-words text-xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Student'}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-400">
                  {user?.email || 'No email available'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 sm:self-center">
                <CheckCircle2 className="h-4 w-4" />
                Account profile
              </div>
            </div>
          </section>

          {/* Status message */}
          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${
                saveSuccess
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
              }`}
            >
              {saveSuccess ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal information */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>
                    Personal Information
                  </h2>
                  <p className={sectionDescriptionClass}>
                    Your registered account details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="student-name">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="student-name"
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-slate-50 pl-10 dark:bg-slate-800/60`}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Your registered name is shown here.
                  </p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="student-email">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="student-email"
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-slate-50 pl-10 dark:bg-slate-800/60`}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Your registered email address.
                  </p>
                </div>
              </div>
            </section>

            {/* Academic details */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>
                    Academic Details
                  </h2>
                  <p className={sectionDescriptionClass}>
                    Help ExamMate understand your academic background.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="qualification">
                    Qualification <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="qualification"
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. BTech"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="course">
                    Course / Department <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="course"
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. Computer Science"
                      maxLength={150}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="institution">
                    College / Institution
                  </label>

                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="institution"
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="Enter your college or institution"
                      maxLength={200}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Institution details are optional.
                  </p>
                </div>
              </div>
            </section>

            {/* Study preferences */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>
                    Study Preferences
                  </h2>
                  <p className={sectionDescriptionClass}>
                    Choose a realistic daily study target.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Target className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <label
                      className={labelClass}
                      htmlFor="daily-hours"
                    >
                      Available Study Time
                    </label>

                    <select
                      id="daily-hours"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(e.target.value)}
                      className={inputClass}
                    >
                      <option value="1.0">1 hour per day</option>
                      <option value="2.0">2 hours per day</option>
                      <option value="3.0">3 hours per day</option>
                      <option value="4.0">4 hours per day</option>
                      <option value="5.0">5 hours per day</option>
                      <option value="6.0">6 hours per day</option>
                    </select>

                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Select the time you can consistently dedicate
                      to studying. Your choice is saved with your profile
                      and can be used by your study-planning features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />

                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Keep your plan realistic
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                    Choose a daily target that fits your classes,
                    assignments, and rest time. You can update it whenever
                    your schedule changes.
                  </p>
                </div>
              </div>
            </section>

            {/* Save action */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Save your changes to update your student profile.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
