import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Clock, GraduationCap, Building, BookOpen, Save, CheckCircle2 } from 'lucide-react';
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
    try {
      setSaving(true);
      setMessage(null);
      await updateProfileData({
        qualification,
        course,
        institution,
        daily_study_hours: parseFloat(dailyHours),
      });
      setMessage('Settings updated successfully.');
    } catch (err) {
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Student Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Manage academic preferences and daily study capacity</p>
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Account & Profile Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">User Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Course / Department</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
                  Daily Available Study Hours
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="1.0">1 Hour / Day</option>
                  <option value="2.0">2 Hours / Day</option>
                  <option value="3.0">3 Hours / Day</option>
                  <option value="4.0">4 Hours / Day</option>
                  <option value="5.0">5 Hours / Day</option>
                  <option value="6.0">6 Hours / Day</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
