import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BookOpenCheck,
  GraduationCap,
  TrendingUp,
  Bell,
  Settings,
  ListOrdered,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Sidebar: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ isOpen, onClose }) => {
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Syllabus Upload', path: '/syllabus-upload', icon: FileText },
    { label: 'Syllabus Overview', path: '/syllabus-overview', icon: ListOrdered },
    { label: 'Timetable', path: '/timetable', icon: Calendar },
    { label: 'Regular Study', path: '/regular-study', icon: BookOpenCheck },
    { label: 'Exam Prep Mode', path: '/exam-prep', icon: GraduationCap },
    { label: 'Exams', path: '/exams', icon: GraduationCap },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 flex w-64 flex-col justify-between border-r border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950 lg:static ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } transform transition-transform ease-in-out duration-200`}
      >
        {/* Navigation links */}
        <div className="space-y-1.5 overflow-y-auto p-4 pt-6">
          <div className="px-3 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 font-bold text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer */}
        <div className="m-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-500/20 dark:text-orange-400">
              EM
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                ExamMate v1.0
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Adaptive Assistant
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};