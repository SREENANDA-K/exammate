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

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
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
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1.5 overflow-y-auto pt-6">
          <div className="px-3 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Navigation</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              EM
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">ExamMate v1.0</p>
              <p className="text-[11px] text-slate-500">Adaptive Assistant</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
