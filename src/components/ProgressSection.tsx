import React, { useState } from 'react';
import { Award, Flame, Clock, CheckCircle2, Trash2, Plus, ShieldCheck, BarChart2 } from 'lucide-react';
import { CompletedSession, Subject } from '../types';

interface ProgressSectionProps {
  completedSessions: CompletedSession[];
  onDeleteSession: (id: string) => void;
  onAddManualSession: (session: CompletedSession) => void;
  willpowerPoints: number;
  dailyGoalHours: number;
  subjects: Subject[];
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  completedSessions,
  onDeleteSession,
  onAddManualSession,
  willpowerPoints,
  dailyGoalHours,
  subjects,
}) => {
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSubject, setManualSubject] = useState(subjects[0]?.name || 'General Study');
  const [manualMinutes, setManualMinutes] = useState(25);
  const [manualNote, setManualNote] = useState('');

  // Calculations
  const totalMinutes = completedSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const goalProgressPercent = Math.min(100, Math.round((totalMinutes / (dailyGoalHours * 60)) * 100));

  // Subject breakdown
  const subjectTotals: { [key: string]: number } = {};
  completedSessions.forEach((s) => {
    subjectTotals[s.subjectName] = (subjectTotals[s.subjectName] || 0) + s.durationMinutes;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: CompletedSession = {
      id: `manual-${Date.now()}`,
      subjectName: manualSubject,
      durationMinutes: Number(manualMinutes) || 25,
      completedAt: new Date().toISOString(),
      notes: manualNote.trim() || 'Manual offline focus sprint logged.',
    };
    onAddManualSession(newSession);
    setShowManualModal(false);
    setManualNote('');
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Study Progress &amp; Streaks
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track your 25-minute sprints, total focus hours, and phone-free willpower wins.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="self-start sm:self-auto text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>Log Completed Sprint</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {totalHours} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalMinutes} total minutes in deep focus
          </p>
        </div>

        {/* Completed Sprints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Sprints Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {completedSessions.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            25-min Pomodoro sprints
          </p>
        </div>

        {/* Study Streak */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            3 <span className="text-sm font-normal text-slate-500">Days</span>
          </div>
          <p className="text-xs text-amber-600 font-medium mt-1">
            Keep the momentum going!
          </p>
        </div>

        {/* Willpower Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Phone Urges Beat</span>
            <ShieldCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {willpowerPoints}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Times you put phone down
          </p>
        </div>
      </div>

      {/* Daily Goal Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-900">
            Daily Goal Progress ({totalHours} / {dailyGoalHours} hrs)
          </span>
          <span className="font-semibold text-indigo-600 tabular-nums">
            {goalProgressPercent}% Completed
          </span>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${goalProgressPercent}%` }}
          />
        </div>

        <p className="text-xs text-slate-500">
          {goalProgressPercent >= 100
            ? '🎉 Outstanding work! You hit your daily study goal.'
            : `You need ${Math.max(0, Math.ceil((dailyGoalHours * 60 - totalMinutes) / 25))} more 25-minute sprint(s) to hit today's target.`}
        </p>
      </div>

      {/* Two Column Layout: Subject Breakdown + Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Subject Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Time by Subject</span>
          </h3>

          {Object.keys(subjectTotals).length === 0 ? (
            <p className="text-xs text-slate-500">No sessions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(subjectTotals).map(([subj, mins]) => {
                const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
                return (
                  <div key={subj} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate">{subj}</span>
                      <span className="text-slate-500 font-semibold tabular-nums">{mins} mins</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Completed Sessions Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Completed Study Session Log</span>
          </h3>

          {completedSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-2">
              <p className="text-sm">No completed study sessions yet.</p>
              <p className="text-xs">
                Start a 25-minute sprint in the Focus Timer tab to record your first session!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {completedSessions.map((session) => {
                const date = new Date(session.completedAt);
                const timeString = isNaN(date.getTime())
                  ? 'Recent'
                  : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={session.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 truncate">
                          {session.subjectName}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-emerald-700 font-semibold">
                          +{session.durationMinutes} mins
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-400 tabular-nums">{timeString}</span>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-slate-600 mt-1 truncate">
                          {session.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-900 text-lg">Log Offline Focus Session</h4>
            
            <form onSubmit={handleManualSubmit} className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Subject
                </label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="General Revision">General Revision</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Session Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Worked through problem set 4"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
