import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  FileText,
  Calendar,
  TrendingUp,
  GraduationCap,
  RefreshCw,
  CheckCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Adaptive Study Assistant for Students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            EXAMMATE
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-500 mt-2">
              “Your syllabus. Your schedule. Your study plan.”
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            ExamMate transforms your syllabus into a personalized study plan and helps you stay on track through regular
            study scheduling, exam preparation, progress tracking, and adaptive rescheduling.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-center"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Workflow Diagram */}
          <div className="mt-16 pt-8 border-t border-slate-200 max-w-5xl mx-auto">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-8">
              How ExamMate Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">1. Syllabus</h3>
                <p className="text-xs text-slate-500 mt-2">Upload your official syllabus PDF for topic extraction</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">2. Personalized Plan</h3>
                <p className="text-xs text-slate-500 mt-2">Generates daily study timetable matching your study hours</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">3. Progress</h3>
                <p className="text-xs text-slate-500 mt-2">Track real topic completion & adaptive rescheduling</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">4. Exam Preparation</h3>
                <p className="text-xs text-slate-500 mt-2">Targeted revision mode 1 week prior to exams</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Designed for Serious Preparation</h2>
            <p className="text-slate-600 mt-3 text-base">
              Built specifically to streamline academic success without manual scheduling stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-500" />
              <h3 className="font-bold text-lg text-slate-900">Adaptive Rescheduling</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Missed a study session? ExamMate detects missed slots and moves them into available future times automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <GraduationCap className="w-8 h-8 text-brand-500" />
              <h3 className="font-bold text-lg text-slate-900">Dedicated Exam Prep Mode</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generates a separate revision schedule prior to exam dates, prioritizing weak and pending subjects.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <ShieldCheck className="w-8 h-8 text-brand-500" />
              <h3 className="font-bold text-lg text-slate-900">Actual Syllabus Processing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload your official PDF syllabus. Extract subjects, modules, and topics directly into your personal database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-white text-base">ExamMate</span>
          </div>
          <p className="text-xs text-slate-400">
            © 2026 ExamMate - Adaptive Study Planning & Exam Preparation Assistant.
          </p>
        </div>
      </footer>
    </div>
  );
};
