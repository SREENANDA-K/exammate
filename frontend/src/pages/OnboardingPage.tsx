
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Building,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfileData } = useAuth();
  const navigate = useNavigate();

  const [qualification, setQualification] = useState('BTech');
  const [course, setCourse] = useState('Computer Science');
  const [institution, setInstitution] = useState('');
  const [dailyHours, setDailyHours] = useState('3.0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setQualification(user.profile.qualification || 'BTech');
      setCourse(user.profile.course || 'Computer Science');
      setInstitution(user.profile.institution || '');
      setDailyHours(
        user.profile.daily_study_hours?.toString() || '3.0'
      );
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await updateProfileData({
        qualification,
        course,
        institution,
        daily_study_hours: parseFloat(dailyHours),
      });

      // Proceed to mandatory syllabus upload
      navigate('/syllabus-upload');
    } catch (err) {
      console.error('Failed to save onboarding data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-black/20 p-8 transition-colors duration-300">

          {/* Header */}
          <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-2">
            <span>Step 1 of 2</span>
            <span>•</span>
            <span>Student Profile</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Student Onboarding
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-8">
            Tell ExamMate about your academic program and daily available
            study time to customize your timetable.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Student Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                Student Name
              </label>

              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold cursor-not-allowed"
              />
            </div>

            {/* Qualification and Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  Qualification / Degree
                </label>

                <div className="relative">
                  <GraduationCap className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />

                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. BTech, BSc, Class 12"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  Course / Department
                </label>

                <div className="relative">
                  <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />

                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. Computer Science"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

            </div>

            {/* Institution */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                Institution / University (Optional)
              </label>

              <div className="relative">
                <Building className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />

                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Kerala Technological University"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Daily Study Hours */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                Daily Available Study Hours
              </label>

              <div className="relative">
                <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />

                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="1.0">1 Hour / Day</option>
                  <option value="2.0">2 Hours / Day</option>
                  <option value="3.0">3 Hours / Day (Recommended)</option>
                  <option value="4.0">4 Hours / Day</option>
                  <option value="5.0">5 Hours / Day</option>
                  <option value="6.0">6 Hours / Day</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Your regular study timetable will be generated around this
                daily capacity.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save &amp; Continue to Syllabus Upload</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};