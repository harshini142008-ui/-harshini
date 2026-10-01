import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Sparkles, CheckCircle2, Play, RefreshCw, BookOpen, AlertCircle, Bot, Code, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Subject, StudentProfile, StudyPlan, TimetableSlot } from '../types';
import { DEFAULT_SUBJECTS, generateDailyTimetable, getDefaultExamDate } from '../utils/storage';

interface AIStrategyResult {
  focusMotto: string;
  subjectTactics: {
    subject: string;
    highYieldTactic: string;
    avoidPitfall: string;
  }[];
  phoneShieldTip: string;
  recommendedSprintSplit: string;
}

interface PlanGeneratorProps {
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
  studyPlan: StudyPlan | null;
  setStudyPlan: (plan: StudyPlan) => void;
  onSelectSlotForFocus: (subjectName: string) => void;
}

export const PlanGeneratorSection: React.FC<PlanGeneratorProps> = ({
  profile,
  setProfile,
  studyPlan,
  setStudyPlan,
  onSelectSlotForFocus,
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectPriority, setNewSubjectPriority] = useState<'high' | 'medium' | 'normal'>('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // AI Strategy states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<AIStrategyResult | null>(null);
  const [showPromptInspector, setShowPromptInspector] = useState(false);
  const [systemPromptSnippet, setSystemPromptSnippet] = useState<string>('');

  // Add subject handler
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const colors = ['indigo', 'violet', 'emerald', 'amber', 'rose', 'sky', 'cyan'];
    const randomColor = colors[profile.subjects.length % colors.length];

    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: newSubjectName.trim(),
      priority: newSubjectPriority,
      color: randomColor,
    };

    const updated = {
      ...profile,
      subjects: [...profile.subjects, newSubject],
    };
    setProfile(updated);
    setNewSubjectName('');
  };

  // Remove subject handler
  const handleRemoveSubject = (id: string) => {
    if (profile.subjects.length <= 1) {
      alert('Keep at least one subject to generate your study timetable.');
      return;
    }
    const updated = {
      ...profile,
      subjects: profile.subjects.filter((s) => s.id !== id),
    };
    setProfile(updated);
  };

  // Reset to sample defaults
  const handleLoadSample = () => {
    const updated: StudentProfile = {
      subjects: DEFAULT_SUBJECTS,
      examDate: getDefaultExamDate(),
      dailyHours: 4,
      startTime: '09:00',
    };
    setProfile(updated);
    const plan = generateDailyTimetable(updated);
    setStudyPlan(plan);
    setSuccessMessage('Loaded sample college syllabus & generated timetable!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Generate Plan handler
  const handleGenerate = () => {
    if (profile.subjects.length === 0) {
      alert('Please add at least one subject first.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const plan = generateDailyTimetable(profile);
      setStudyPlan(plan);
      setIsGenerating(false);
      setSuccessMessage('Your personalized 25-minute timetable is ready!');
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 400);
  };

  // Generate AI Study Strategy using Gemini API
  const handleGenerateAiStrategy = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/study-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: profile.subjects,
          examDate: profile.examDate,
          dailyHours: profile.dailyHours,
          daysUntilExam: daysLeft,
        }),
      });
      const data = await res.json();
      if (data.strategy) {
        setAiStrategy(data.strategy);
        if (data.systemInstruction) {
          setSystemPromptSnippet(data.systemInstruction);
        }
      }
    } catch {
      // Fallback
      setAiStrategy({
        focusMotto: "Small 25-minute sprints eliminate exam terror.",
        subjectTactics: profile.subjects.map(s => ({
          subject: s.name,
          highYieldTactic: "Active Recall: Write everything you remember onto a blank sheet for 10 minutes without looking.",
          avoidPitfall: "Re-reading notes while glancing at phone notifications."
        })),
        phoneShieldTip: "Out of sight, out of mind. Put your phone in another room or facedown in your bag.",
        recommendedSprintSplit: "Start with your hardest subject first while willpower is highest."
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Toggle slot completion
  const handleToggleSlot = (slotId: string) => {
    if (!studyPlan) return;
    const updatedSlots = studyPlan.slots.map((s) =>
      s.id === slotId ? { ...s, completed: !s.completed } : s
    );
    setStudyPlan({
      ...studyPlan,
      slots: updatedSlots,
    });
  };

  // Calculate days remaining
  const calculateDaysLeft = () => {
    if (!profile.examDate) return 0;
    const exam = new Date(profile.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);
    const diff = exam.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Study Plan Generator
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Input your courses, target exam date, and available study hours to generate your daily timetable.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPromptInspector(!showPromptInspector)}
            className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Inspect Prompt Engineering"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prompt Inspector</span>
          </button>
          <button
            onClick={handleLoadSample}
            className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Sample College Syllabus</span>
          </button>
        </div>
      </div>

      {/* Prompt Engineering Inspector Card */}
      {showPromptInspector && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 space-y-3 text-xs border border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              Prompt Engineering Challenge Architecture
            </span>
            <span className="text-slate-400 font-mono">model: gemini-3.8-flash</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            FocusAI uses <strong>role specification</strong>, <strong>few-shot anti-distraction heuristics</strong>, and <strong>strict JSON schema enforcement</strong> (`responseMimeType: application/json`) to eliminate hallucination and guarantee actionable 25-minute sprint strategies.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-36">
            {systemPromptSnippet || `System Instruction: You are FocusAI, an expert cognitive science and college exam coach specializing in high-yield study sprints and overcoming smartphone distraction. Respond with structured JSON schema including focusMotto, subjectTactics, and phoneShieldTip.`}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Inputs Column + Timetable Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>1. Enter Your Subjects</span>
            </h3>

            {/* Subject List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {profile.subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        sub.color === 'indigo'
                          ? 'bg-indigo-500'
                          : sub.color === 'violet'
                          ? 'bg-violet-500'
                          : sub.color === 'emerald'
                          ? 'bg-emerald-500'
                          : sub.color === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {sub.name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {sub.priority} Priority
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveSubject(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subject Input */}
            <form onSubmit={handleAddSubject} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">
                Add another subject
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1 text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newSubjectPriority}
                  onChange={(e) => setNewSubjectPriority(e.target.value as 'high' | 'medium' | 'normal')}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Med</option>
                  <option value="normal">Normal</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Exam Date & Hours Parameters */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>2. Exam Date & Hours</span>
              </h3>

              {/* Exam Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Target Exam Date
                  </label>
                  <span className="text-xs font-bold text-indigo-600">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Exam today or passed'}
                  </span>
                </div>
                <input
                  type="date"
                  value={profile.examDate}
                  onChange={(e) => setProfile({ ...profile, examDate: e.target.value })}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Available Study Hours */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Available Study Hours Today
                  </label>
                  <span className="text-xs font-bold text-slate-900">
                    {profile.dailyHours} Hours ({profile.dailyHours * 2} focus sprints)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.dailyHours}
                  onChange={(e) => setProfile({ ...profile, dailyHours: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>1 hr (Quick review)</span>
                  <span>4 hrs (Recommended)</span>
                  <span>10 hrs (Intense)</span>
                </div>
              </div>

              {/* Starting Time */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Timetable Start Time
                </label>
                <input
                  type="time"
                  value={profile.startTime || '09:00'}
                  onChange={(e) => setProfile({ ...profile, startTime: e.target.value })}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Generate Plan Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calculating Optimal Timetable...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Generate Daily Timetable</span>
                  </>
                )}
              </button>

              {/* AI Strategy Optimizer Button */}
              <button
                onClick={handleGenerateAiStrategy}
                disabled={isAiLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini AI Analyzing Syllabus...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Generate Custom Study Strategy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Timetable (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* AI Strategy Display Box */}
          {aiStrategy && (
            <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    AI Study Strategy &amp; Cognitive Tactics
                  </h4>
                </div>
                <span className="text-[11px] text-indigo-700 bg-indigo-100/60 font-semibold px-2 py-0.5 rounded">
                  Gemini Flash 3.8
                </span>
              </div>

              {/* Motto */}
              <div className="p-3 bg-white/90 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-900 italic">
                &ldquo;{aiStrategy.focusMotto}&rdquo;
              </div>

              {/* Subject Tactics List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  High-Yield Subject Advice:
                </span>
                {aiStrategy.subjectTactics.map((tac, idx) => (
                  <div key={idx} className="p-3 bg-white/80 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <span className="font-bold text-slate-900">{tac.subject}:</span>{' '}
                    <span className="text-slate-700">{tac.highYieldTactic}</span>
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      ⚠️ Avoid: {tac.avoidPitfall}
                    </p>
                  </div>
                ))}
              </div>

              {/* Anti-Phone Shield Tip */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                <span className="font-bold text-amber-800">🛡️ Anti-Phone Strategy:</span>{' '}
                <span>{aiStrategy.phoneShieldTip}</span>
              </div>
            </div>
          )}

          {!studyPlan ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Timetable Generated Yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Set your subjects and available study hours on the left, then click <strong>&quot;Generate Daily Timetable&quot;</strong> or load our sample college syllabus.
                </p>
              </div>
              <button
                onClick={handleLoadSample}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Generate Sample College Plan
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              {/* Timetable Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>{studyPlan.generatedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{studyPlan.dailyHours} Study Hours</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-600">{studyPlan.slots.filter(s => s.type === 'focus').length} Focus Sprints</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Today&apos;s Pomodoro Timetable
                  </h3>
                </div>

                <button
                  onClick={handleGenerate}
                  className="self-start sm:self-auto text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Phone-Free Reminder Banner */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Anti-Phone Rule:</strong> Keep your phone in another room or facedown across the desk during each 25-minute sprint.
                </span>
              </div>

              {/* Slot Cards List */}
              <div className="space-y-2.5">
                {studyPlan.slots.map((slot) => {
                  const isFocus = slot.type === 'focus';
                  const isLongBreak = slot.type === 'long_break';

                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        slot.completed
                          ? 'bg-slate-50/80 border-slate-200 opacity-60'
                          : isFocus
                          ? 'bg-white border-slate-200 hover:border-indigo-300'
                          : isLongBreak
                          ? 'bg-amber-50/40 border-amber-200/60'
                          : 'bg-emerald-50/40 border-emerald-200/60'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Completion Checkbox */}
                        <button
                          onClick={() => handleToggleSlot(slot.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                            slot.completed
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 hover:border-indigo-500'
                          }`}
                          title={slot.completed ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {slot.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-700 tabular-nums">
                              {slot.timeRange}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span
                              className={`font-medium ${
                                isFocus
                                  ? 'text-indigo-600'
                                  : isLongBreak
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {isFocus ? `${slot.durationMinutes}m Deep Focus` : `${slot.durationMinutes}m Recovery Break`}
                            </span>
                          </div>

                          <p
                            className={`text-sm font-semibold mt-0.5 truncate ${
                              slot.completed ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {slot.taskDescription}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action for Focus Sprint */}
                      {isFocus && !slot.completed && (
                        <button
                          onClick={() => onSelectSlotForFocus(slot.subjectName || 'Study Session')}
                          className="shrink-0 self-end sm:self-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                        >
                          <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                          <span>Start Timer</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

