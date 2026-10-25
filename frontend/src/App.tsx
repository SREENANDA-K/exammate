
import React from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SyllabusUploadPage } from './pages/SyllabusUploadPage';
import { SyllabusReviewPage } from './pages/SyllabusReviewPage';
import { DashboardPage } from './pages/DashboardPage';
import { TimetablePage } from './pages/TimetablePage';
import { RegularStudyModePage } from './pages/RegularStudyModePage';
import { ExamPrepModePage } from './pages/ExamPrepModePage';
import { ExamsPage } from './pages/ExamsPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Loading ExamMate...
          </p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">
          Loading ExamMate...
        </p>
      </div>
    );
  }

  if (user) {
    const from = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname;

    return <Navigate to={from || '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ThemeToggle />

          <Routes>
            {/* Home: dashboard for logged-in users, landing page otherwise */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public routes: only for logged-out users */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignUpPage />
                </PublicOnlyRoute>
              }
            />

            {/* Authenticated protected routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/syllabus-upload"
              element={
                <ProtectedRoute>
                  <SyllabusUploadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/syllabus-overview"
              element={
                <ProtectedRoute>
                  <SyllabusReviewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <TimetablePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/regular-study"
              element={
                <ProtectedRoute>
                  <RegularStudyModePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exam-prep"
              element={
                <ProtectedRoute>
                  <ExamPrepModePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exams"
              element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};