import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Authenticated Protected Routes */}
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};
