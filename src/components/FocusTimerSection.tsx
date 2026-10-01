import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Volume2, VolumeX, ShieldAlert, Sparkles, Smartphone, Wind, AlertCircle, Heart, Bot, Send, MessageSquare } from 'lucide-react';
import { sounds } from '../utils/audio';
import { Subject, CompletedSession } from '../types';

interface FocusTimerProps {
  currentSubject: string;
  subjects: Subject[];
  onSessionComplete: (session: CompletedSession) => void;
  willpowerPoints: number;
  onIncrementWillpower: () => void;
}

export const FocusTimerSection: React.FC<FocusTimerProps> = ({
  currentSubject,
  subjects,
  onSessionComplete,
  willpowerPoints,
  onIncrementWillpower,
}) => {
  // Timer durations in seconds
  const FOCUS_TIME = 25 * 60; // 25 mins
  const SHORT_BREAK = 5 * 60;  // 5 mins
  const LONG_BREAK = 15 * 60;  // 15 mins

  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [selectedSubject, setSelectedSubject] = useState(currentSubject || (subjects[0]?.name ?? 'General Study'));
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'whitenoise' | 'waves'>('off');
  
  // Distraction Shield states
  const [phoneChecklist, setPhoneChecklist] = useState({
    faceDown: true,
    silent: true,
    farAway: false,
  });
  const [showUrgeBreather, setShowUrgeBreather] = useState(false);
  const [breatherSeconds, setBreatherSeconds] = useState(10);
  const [blurAlertCount, setBlurAlertCount] = useState(0);
  const [showBlurModal, setShowBlurModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // AI Distraction Coach states
  const [showCoach, setShowCoach] = useState(false);
  const [coachInput, setCoachInput] = useState('');
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const originalTitleRef = useRef(document.title);

  // Sync selected subject if prop changes
  useEffect(() => {
    if (currentSubject) {
      setSelectedSubject(currentSubject);
    }
  }, [currentSubject]);

  // Mode change handler
  const handleModeChange = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') setTimeLeft(FOCUS_TIME);
    else if (newMode === 'short_break') setTimeLeft(SHORT_BREAK);
    else setTimeLeft(LONG_BREAK);
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed!
      sounds.playCompletionChime();
      setIsRunning(false);
      if (mode === 'focus') {
        const completed: CompletedSession = {
          id: `session-${Date.now()}`,
          subjectName: selectedSubject,
          durationMinutes: 25,
          completedAt: new Date().toISOString(),
          notes: sessionNotes || '25-minute deep focus sprint finished without phone distraction!',
        };
        onSessionComplete(completed);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, selectedSubject, sessionNotes, onSessionComplete]);

  // Tab switch / visibility blur detector for phone distraction reminder
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && mode === 'focus') {
        document.title = '🚨 Stay Focused! Put Down Your Phone!';
        sounds.playGentleNudge();
        setBlurAlertCount((prev) => prev + 1);
      } else {
        document.title = 'FocusAI - Study Plan & Focus Timer';
        if (isRunning && mode === 'focus') {
          setShowBlurModal(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = 'FocusAI - Study Plan & Focus Timer';
    };
  }, [isRunning, mode]);

  // Ambient sound management
  useEffect(() => {
    if (ambientSound === 'off' || !isRunning) {
      sounds.stopAmbient();
    } else {
      sounds.startAmbient(ambientSound, 0.08);
    }
    return () => {
      sounds.stopAmbient();
    };
  }, [ambientSound, isRunning]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress ring calculations
  const totalDuration = mode === 'focus' ? FOCUS_TIME : mode === 'short_break' ? SHORT_BREAK : LONG_BREAK;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = 100 - progressPercent;

  // Complete manually
  const handleCompleteEarly = () => {
    if (window.confirm('Finish and log this focus session now?')) {
      sounds.playCompletionChime();
      setIsRunning(false);
      const completedMinutes = Math.max(1, Math.round((totalDuration - timeLeft) / 60));
      const completed: CompletedSession = {
        id: `session-${Date.now()}`,
        subjectName: selectedSubject,
        durationMinutes: completedMinutes,
        completedAt: new Date().toISOString(),
        notes: sessionNotes || 'Focused session logged.',
      };
      onSessionComplete(completed);
      setTimeLeft(totalDuration);
    }
  };

  // 10-second urge breather logic
  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (showUrgeBreather && breatherSeconds > 0) {
      t = setInterval(() => {
        setBreatherSeconds((prev) => prev - 1);
      }, 1000);
    } else if (showUrgeBreather && breatherSeconds === 0) {
      // Reward willpower!
      onIncrementWillpower();
      sounds.playCompletionChime();
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [showUrgeBreather, breatherSeconds, onIncrementWillpower]);

  const startUrgeBreather = () => {
    setBreatherSeconds(10);
    setShowUrgeBreather(true);
  };

  // Handle Ask AI Coach
  const handleAskCoach = async (reason?: string) => {
    const context = reason || coachInput || 'I feel bored and want to scroll social media';
    setIsCoachLoading(true);
    try {
      const res = await fetch('/api/gemini/distraction-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urgeContext: context,
          subject: selectedSubject,
        }),
      });
      const data = await res.json();
      setCoachAdvice(data.advice);
    } catch {
      setCoachAdvice(
        "Take a slow breath. What feels hard right now will become easier in 5 minutes. Delay checking your phone until this 25-minute sprint ends!"
      );
    } finally {
      setIsCoachLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Tab Blur Warning Modal */}
      {showBlurModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Phone Distraction Warning!</h4>
                <p className="text-xs text-rose-600">You switched away from your study sprint</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Did you pick up your phone or open social media? Context switching resets your brain&apos;s deep focus momentum. Put the phone back down and let&apos;s finish this 25-minute sprint!
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onIncrementWillpower();
                  setShowBlurModal(false);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-95"
              >
                I Resisted &amp; Put Phone Down (+1 Willpower)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10-Second Urge Breather Modal */}
      {showUrgeBreather && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
              <Wind className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">10-Second Phone Pause</h3>
              <p className="text-sm text-slate-600">
                Close your eyes and breathe deeply. 90% of phone-checking impulses disappear when delayed by just 10 seconds.
              </p>
            </div>

            {breatherSeconds > 0 ? (
              <div className="space-y-3">
                <div className="text-5xl font-extrabold text-indigo-600 font-mono tabular-nums">
                  {breatherSeconds}s
                </div>
                <p className="text-xs text-slate-500 italic">
                  {breatherSeconds > 6 ? 'Inhale slowly through your nose...' : breatherSeconds > 3 ? 'Hold and relax your shoulders...' : 'Exhale slowly... the urge is fading.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Awesome willpower! You beat the urge.</span>
                </div>
                <p className="text-xs text-slate-600">+1 Willpower Point added to your score!</p>
                <button
                  onClick={() => setShowUrgeBreather(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm cursor-pointer"
                >
                  Return to Focus Sprint
                </button>
              </div>
            )}

            {breatherSeconds > 0 && (
              <button
                onClick={() => setShowUrgeBreather(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel breather
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Focus Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Timer Box (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-6">
          
          {/* Mode Selector Tabs (Functional segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => handleModeChange('focus')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'focus'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              25m Focus Sprint
            </button>
            <button
              onClick={() => handleModeChange('short_break')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'short_break'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5m Short Break
            </button>
            <button
              onClick={() => handleModeChange('long_break')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'long_break'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15m Rest Break
            </button>
          </div>

          {/* Subject Dropdown Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Studying:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="General Revision">General Revision</option>
            </select>
          </div>

          {/* SVG Circular Countdown Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`transition-all duration-1000 ${
                  mode === 'focus'
                    ? 'stroke-indigo-600'
                    : mode === 'short_break'
                    ? 'stroke-emerald-500'
                    : 'stroke-amber-500'
                }`}
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset={(264 * strokeDashoffset) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Timer Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">
                {isRunning ? (mode === 'focus' ? 'Deep Work In Progress' : 'Recovery In Progress') : 'Paused'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3 w-full justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start 25m Sprint</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(totalDuration);
              }}
              className="p-3.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {isRunning && mode === 'focus' && (
              <button
                onClick={handleCompleteEarly}
                className="px-4 py-3.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
                title="Finish and log now"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Finish Early</span>
              </button>
            )}
          </div>

          {/* Ambient Sound Selector */}
          <div className="w-full pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              Focus Sound:
            </span>
            <div className="flex items-center gap-1">
              {(['off', 'rain', 'whitenoise', 'waves'] as const).map((snd) => (
                <button
                  key={snd}
                  onClick={() => setAmbientSound(snd)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                    ambientSound === snd
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {snd === 'off' ? 'Mute' : snd === 'whitenoise' ? 'White Noise' : snd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Distraction Reminder & Anti-Phone Defense Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency 10-Second Urge Breather Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-lg shadow-indigo-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Phone Urge Shield</h3>
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
                Anti-Dopamine
              </span>
            </div>

            <p className="text-xs text-indigo-200 leading-relaxed">
              Craving Instagram, TikTok, or WhatsApp? Don&apos;t give in. Delay the urge by 10 seconds with our calming guided pause.
            </p>

            <div className="flex gap-2">
              <button
                onClick={startUrgeBreather}
                className="flex-1 py-3 bg-white text-slate-950 hover:bg-indigo-50 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>10s Phone Pause</span>
              </button>

              <button
                onClick={() => setShowCoach(!showCoach)}
                className="py-3 px-3.5 bg-indigo-700/60 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-400/30"
                title="Ask AI Distraction Coach"
              >
                <Bot className="w-4 h-4 text-indigo-300" />
                <span>AI Coach</span>
              </button>
            </div>

            {/* AI Coach Expanded Drawer */}
            {showCoach && (
              <div className="bg-slate-950/70 border border-indigo-400/30 rounded-2xl p-3.5 space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between text-indigo-200">
                  <span className="font-bold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    AI Anti-Distraction Coach
                  </span>
                  <span className="text-[10px] text-indigo-300">Gemini 3.8</span>
                </div>

                {coachAdvice ? (
                  <div className="bg-indigo-950/90 border border-indigo-500/40 rounded-xl p-3 space-y-2">
                    <p className="text-indigo-100 text-xs leading-relaxed italic">
                      &ldquo;{coachAdvice}&rdquo;
                    </p>
                    <button
                      onClick={() => setCoachAdvice(null)}
                      className="text-[10px] text-indigo-300 hover:text-white underline cursor-pointer"
                    >
                      Ask another question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-indigo-300">
                      Why are you tempted to pick up your phone?
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {['Bored', 'Instagram / Chat', 'Stuck on problem', 'Anxious'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleAskCoach(tag)}
                          disabled={isCoachLoading}
                          className="px-2 py-1 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 rounded-lg text-[10px] border border-indigo-500/30 cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Or type what's tempting you..."
                        value={coachInput}
                        onChange={(e) => setCoachInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskCoach()}
                        className="flex-1 bg-slate-900 border border-indigo-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => handleAskCoach()}
                        disabled={isCoachLoading}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {isCoachLoading ? '...' : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-indigo-300 pt-1">
              <span>Willpower score: {willpowerPoints} pts</span>
              <button
                onClick={onIncrementWillpower}
                className="hover:text-white underline cursor-pointer"
              >
                +1 Urge Resisted manually
              </button>
            </div>
          </div>

          {/* Pre-Sprint Phone Protocol Checklist */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-600" />
              <span>Pre-Sprint Anti-Phone Checklist</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={phoneChecklist.faceDown}
                  onChange={(e) => setPhoneChecklist({ ...phoneChecklist, faceDown: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span>Phone is screen-down or in my backpack</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={phoneChecklist.silent}
                  onChange={(e) => setPhoneChecklist({ ...phoneChecklist, silent: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span>&apos;Do Not Disturb&apos; or Airplane mode is ON</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={phoneChecklist.farAway}
                  onChange={(e) => setPhoneChecklist({ ...phoneChecklist, farAway: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span>Phone placed out of immediate arm&apos;s reach</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
              💡 <em>Harvard Business Review:</em> Even a silent phone within eyesight reduces available cognitive capacity by 10-15%.
            </div>
          </div>

          {/* Session Note (Optional) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              Sprint Focus Goal (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Solve 5 integration practice problems"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
