import React, { useState } from 'react';
import { Bell, CheckCheck, AlertCircle, Info, Calendar, GraduationCap } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const NotificationsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Notifications & Alerts</h1>
              <p className="text-sm text-slate-500 mt-1">
                Study session reminders, missed session rescheduling alerts, and exam prep notifications
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead('all')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <CheckCheck className="w-4 h-4 text-brand-600" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            {notifications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400">
                  Alerts will appear here as study sessions are generated or rescheduled.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                    notif.is_read ? 'bg-slate-50 border-slate-200' : 'bg-brand-50/40 border-brand-200 font-semibold'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        notif.type === 'EXAM'
                          ? 'bg-purple-100 text-purple-700'
                          : notif.type === 'MISSED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-brand-100 text-brand-700'
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

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{notif.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
