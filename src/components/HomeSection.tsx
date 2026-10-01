import React from 'react';
import { Smartphone, Zap, CheckCircle2, ShieldCheck, ArrowRight, Brain, Clock, BellOff } from 'lucide-react';

interface HomeSectionProps {
  onGetStarted: () => void;
  onStartFocus: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onGetStarted, onStartFocus }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-3 py-1.5 rounded-full border border-indigo-100">
          <span>FocusAI Prototype</span>
          <span aria-hidden="true">·</span>
          <span>Designed for College Students</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 text-balance leading-tight">
          Stop losing study hours to your phone. Study in 25-minute sprints.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          The smart companion that turns your exam dates into an actionable daily timetable, enforces phone-free deep work, and turns study sessions into streaks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>Create Your Study Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onStartFocus}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-sm"
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Launch 25m Focus Timer</span>
          </button>
        </div>

        {/* Quiet proof metrics */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            25-minute Pomodoro science
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <BellOff className="w-4 h-4 text-indigo-600" />
            Active tab distraction alerts
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Phone impulse delay technique
          </span>
        </div>
      </section>

      {/* Problem vs Solution Split Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* The Problem Card */}
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
              <p className="text-xs text-rose-700 font-medium">Why college students struggle to finish exam prep</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm text-slate-700 leading-relaxed">
            <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-600 shrink-0">6 min</span>
              <p>The average student checks their phone every 6 minutes during study sessions, breaking deep cognitive immersion.</p>
            </div>

            <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-600 shrink-0">23 min</span>
              <p>Research confirms it takes up to 23 minutes to regain full focus after a single social notification or group chat ping.</p>
            </div>

            <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-600 shrink-0">Overwhelm</span>
              <p>Students face vast syllabi with no structured hourly roadmap, creating decision fatigue that triggers escape into doom-scrolling.</p>
            </div>
          </div>
        </div>

        {/* The Solution Card */}
        <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">The FocusAI Solution</h2>
              <p className="text-xs text-indigo-700 font-medium">Engineered for distraction-free exam mastery</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm text-slate-700 leading-relaxed">
            <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <p><strong className="text-slate-900">Personalized Daily Timetable:</strong> Input your subjects and exam date. Get an automatic schedule divided into bite-sized 25m sprints with dedicated recovery pauses.</p>
            </div>

            <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <p><strong className="text-slate-900">25-Minute Focus Shield:</strong> Built-in visual countdown timer, relaxing ambient white noise, and anti-phone pledges to lock in attention.</p>
            </div>

            <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <p><strong className="text-slate-900">Active Distraction Interventions:</strong> Tab-switch reminders, 10-second impulse breathing delay, and willpower counters to rewire study habits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Flow */}
      <section className="max-w-4xl mx-auto pt-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">How FocusAI Works in 3 Steps</h2>
          <p className="text-sm text-slate-500">Fast, friction-free study routine for busy college students</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-bold text-indigo-600">STEP 1</div>
            <h3 className="font-semibold text-slate-900 text-base">Enter Your Subjects</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add your courses, upcoming exam date, and realistic daily study hours (e.g. 3 to 6 hours).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-bold text-indigo-600">STEP 2</div>
            <h3 className="font-semibold text-slate-900 text-base">Generate Timetable</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a calculated timetable allocating high-priority topics to 25-minute sprints with scheduled breaks.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-bold text-indigo-600">STEP 3</div>
            <h3 className="font-semibold text-slate-900 text-base">Sprint Without Phone</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hit Start, put your phone across the room, and build a streak of completed study sessions.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
          >
            Go to Student Setup &rarr;
          </button>
        </div>
      </section>
    </div>
  );
};
