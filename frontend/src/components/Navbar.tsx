
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/95 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Logo and sidebar toggle */}
        <div className="flex items-center space-x-3">
          {user && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center space-x-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-extrabold text-white shadow-md shadow-brand-500/20">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">
                EXAM<span className="text-brand-500">MATE</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Adaptive Planner
              </span>
            </div>
          </Link>
        </div>

        {/* Logged-in user actions */}
        {user ? (
          <div className="flex items-center space-x-3">
            <Link
              to="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((previous) => !previous)}
                aria-expanded={dropdownOpen}
                aria-label="Open profile menu"
                className="flex items-center space-x-2 rounded-xl border border-slate-200 p-1.5 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-orange-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 md:block">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon className="mr-2.5 h-4 w-4 text-slate-400" />
                    Student Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Sparkles className="mr-2.5 h-4 w-4 text-slate-400" />
                    Settings
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="mr-2.5 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Logged-out actions */
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-200 dark:hover:text-orange-400"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};