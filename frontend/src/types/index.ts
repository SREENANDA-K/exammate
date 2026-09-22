export interface User {
  id: string;
  name: string;
  email: string;
  profile?: StudentProfile;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  qualification: string;
  course: string;
  institution?: string;
  daily_study_hours: number;
}

export interface Topic {
  id: string;
  module_id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Module {
  id: string;
  subject_id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  syllabus_id: string;
  name: string;
  modules: Module[];
}

export interface Syllabus {
  id: string;
  user_id: string;
  file_name: string;
  subject_name?: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  upload_date: string;
  subjects: Subject[];
}

export interface StudySession {
  id: string;
  user_id: string;
  topic_id: string;
  date: string;
  start_time: string;
  end_time: string;
  mode: 'REGULAR' | 'EXAM_PREP';
  status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED';
  original_session_id?: string;
  rescheduled_from_id?: string;
  topic: {
    id: string;
    name: string;
    module: {
      id: string;
      name: string;
      subject: {
        id: string;
        name: string;
      };
    };
  };
}

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string;
  exam_date: string;
  subject: Subject;
}

export interface ProgressData {
  overallPercentage: number;
  processedPdfCount: number;
  totalSubjectsCount: number;
  totalTopics: number;
  completedTopicsCount: number;
  inProgressTopicsCount: number;
  pendingTopicsCount: number;
  subjectProgress: {
    subjectId: string;
    subjectName: string;
    totalTopics: number;
    completedTopics: number;
    percentage: number;
  }[];
  sessionStats: {
    totalSessions: number;
    completedSessions: number;
    missedSessions: number;
    pendingSessions: number;
  };
  streak: number;
  dailyHours: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'REMINDER' | 'MISSED' | 'EXAM';
  is_read: boolean;
  created_at: string;
}
