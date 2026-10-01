export interface Subject {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'normal';
  color: string;
}

export interface TimetableSlot {
  id: string;
  timeRange: string;
  type: 'focus' | 'short_break' | 'long_break';
  subjectName?: string;
  subjectColor?: string;
  taskDescription: string;
  durationMinutes: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  generatedDate: string;
  examDate: string;
  daysUntilExam: number;
  dailyHours: number;
  slots: TimetableSlot[];
}

export interface CompletedSession {
  id: string;
  subjectName: string;
  durationMinutes: number;
  completedAt: string;
  notes?: string;
}

export interface StudentProfile {
  subjects: Subject[];
  examDate: string;
  dailyHours: number;
  startTime: string;
}
