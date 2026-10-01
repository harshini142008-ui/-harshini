import { StudentProfile, StudyPlan, TimetableSlot, CompletedSession, Subject } from '../types';

const PROFILE_KEY = 'focusai_profile';
const PLAN_KEY = 'focusai_current_plan';
const SESSIONS_KEY = 'focusai_completed_sessions';
const WILLPOWER_KEY = 'focusai_willpower_score';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Calculus & Linear Algebra', priority: 'high', color: 'indigo' },
  { id: '2', name: 'Computer Systems & OS', priority: 'high', color: 'violet' },
  { id: '3', name: 'Organic Chemistry', priority: 'medium', color: 'emerald' },
  { id: '4', name: 'Macroeconomics', priority: 'normal', color: 'amber' },
];

export function getDefaultExamDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14); // 2 weeks ahead
  return date.toISOString().split('T')[0];
}

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    subjects: DEFAULT_SUBJECTS,
    examDate: getDefaultExamDate(),
    dailyHours: 4,
    startTime: '09:00',
  };
}

export function saveStudentProfile(profile: StudentProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadStudyPlan(): StudyPlan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveStudyPlan(plan: StudyPlan) {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch {
    // ignore
  }
}

export function loadCompletedSessions(): CompletedSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [
    {
      id: 'mock-1',
      subjectName: 'Calculus & Linear Algebra',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      notes: 'Covered matrix transformations without touching phone!',
    },
    {
      id: 'mock-2',
      subjectName: 'Computer Systems & OS',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      notes: 'Virtual memory concepts review',
    }
  ];
}

export function saveCompletedSessions(sessions: CompletedSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function loadWillpowerPoints(): number {
  try {
    const raw = localStorage.getItem(WILLPOWER_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {
    // ignore
  }
  return 8; // demo starting points
}

export function saveWillpowerPoints(points: number) {
  try {
    localStorage.setItem(WILLPOWER_KEY, points.toString());
  } catch {
    // ignore
  }
}

// Generate realistic daily timetable with 25-minute Pomodoro focus sprints & breaks
export function generateDailyTimetable(profile: StudentProfile): StudyPlan {
  const { subjects, examDate, dailyHours, startTime } = profile;
  
  // Calculate days until exam
  const exam = new Date(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  const diffTime = exam.getTime() - today.getTime();
  const daysUntilExam = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Each hour yields approx two 25m sprints + 5m breaks = 60m
  const totalSprints = Math.max(2, Math.round(dailyHours * 2));
  
  // Determine subject distribution based on priority
  // High priority gets 2x weight, medium 1.5x, normal 1x
  const activeSubjects = subjects.length > 0 ? subjects : [{ id: '1', name: 'General Study', priority: 'high' as const, color: 'indigo' }];
  
  const weightedSubjects: Subject[] = [];
  activeSubjects.forEach(s => {
    const count = s.priority === 'high' ? 3 : s.priority === 'medium' ? 2 : 1;
    for (let i = 0; i < count; i++) {
      weightedSubjects.push(s);
    }
  });

  const slots: TimetableSlot[] = [];
  const [startHour, startMin] = (startTime || '09:00').split(':').map(Number);
  let currentMinutes = (startHour || 9) * 60 + (startMin || 0);

  const formatTime = (mins: number) => {
    const normalized = mins % (24 * 60);
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m < 10 ? '0' : ''}${m} ${period}`;
  };

  let sprintCounter = 0;
  for (let i = 0; i < totalSprints; i++) {
    const subject = weightedSubjects[i % weightedSubjects.length];
    
    // Focus slot
    const slotStart = currentMinutes;
    const slotEnd = currentMinutes + 25;
    
    const taskSuggestions = [
      'Active Recall: Flashcards & Core Concepts',
      'High-Yield Practice Problems & Formulas',
      'Past Paper Questions Under Time Pressure',
      'Diagrams, Summary Cheat Sheet & Flowcharts',
      'Weak Topic Review & Error Log Analysis',
    ];
    const task = taskSuggestions[sprintCounter % taskSuggestions.length];

    slots.push({
      id: `slot-${i}-focus`,
      timeRange: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`,
      type: 'focus',
      subjectName: subject.name,
      subjectColor: subject.color,
      taskDescription: `${subject.name}: ${task}`,
      durationMinutes: 25,
      completed: false,
    });

    sprintCounter++;
    currentMinutes += 25;

    // After 4 sprints (approx 2 hours), schedule a 15-min long recovery break
    // Otherwise a 5-min short screen-free break
    if (i < totalSprints - 1) {
      if ((i + 1) % 4 === 0) {
        const breakStart = currentMinutes;
        const breakEnd = currentMinutes + 15;
        slots.push({
          id: `slot-${i}-longbreak`,
          timeRange: `${formatTime(breakStart)} - ${formatTime(breakEnd)}`,
          type: 'long_break',
          taskDescription: 'Recharge Walk & Hydration (Keep phone in pocket!)',
          durationMinutes: 15,
          completed: false,
        });
        currentMinutes += 15;
      } else {
        const breakStart = currentMinutes;
        const breakEnd = currentMinutes + 5;
        slots.push({
          id: `slot-${i}-break`,
          timeRange: `${formatTime(breakStart)} - ${formatTime(breakEnd)}`,
          type: 'short_break',
          taskDescription: 'Mind Reset: Deep Breathing & Eye Rest (No Screen)',
          durationMinutes: 5,
          completed: false,
        });
        currentMinutes += 5;
      }
    }
  }

  return {
    id: `plan-${Date.now()}`,
    generatedDate: new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    examDate,
    daysUntilExam,
    dailyHours,
    slots,
  };
}
