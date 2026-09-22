import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Bell, User as UserIcon, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-extrabold shadow-md shadow-brand-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                EXAM<span className="text-brand-500">MATE</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Adaptive Planner</span>
            </div>
          </Link>
        </div>

        {user ? (
          <div className="flex items-center space-x-3">
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-semibold text-slate-700">{user.name}</span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/onboarding"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" />
                    Student Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Sparkles className="w-4 h-4 mr-2.5 text-slate-400" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 mr-2.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
