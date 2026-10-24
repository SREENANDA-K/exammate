import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Info,
  GraduationCap,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const NotificationsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Notifications & Alerts
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Study session reminders, missed session rescheduling alerts,
                and exam prep notifications
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAsRead('all')}
                className="self-start px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <CheckCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-3 transition-colors duration-200">
            {notifications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />

                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No notifications yet
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Alerts will appear here as study sessions are generated or
                  rescheduled.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) {
                      markAsRead(notif.id);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      !notif.is_read &&
                      (event.key === 'Enter' || event.key === ' ')
                    ) {
                      event.preventDefault();
                      markAsRead(notif.id);
                    }
                  }}
                  role="button"
                  tabIndex={notif.is_read ? -1 : 0}
                  aria-label={
                    notif.is_read
                      ? notif.title
                      : `${notif.title}. Mark as read`
                  }
                  className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-3 ${
                    notif.is_read
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      : 'bg-brand-50/60 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-500/15'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'EXAM'
                          ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                          : notif.type === 'MISSED'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            : 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                      }`}
                    >
                      {notif.type === 'EXAM' ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : notif.type === 'MISSED' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <span
                      aria-label="Unread"
                      className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-2"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
