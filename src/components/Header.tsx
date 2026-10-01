import React from 'react';
import { Sparkles, Brain, Clock, BarChart3, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'plan' | 'timer' | 'progress';
  setActiveTab: (tab: 'home' | 'plan' | 'timer' | 'progress') => void;
  willpowerPoints: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, willpowerPoints }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="cursor-pointer flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Focus<span className="text-indigo-600">AI</span>
          </span>
        </div>

        {/* Zone 2: 4 Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'home'
                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'plan'
                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Study Plan
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'timer'
                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            25m Focus Timer
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'progress'
                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Progress
          </button>
        </nav>

        {/* Zone 3: Quick Action & Willpower Points */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/70" title="Willpower Points earned by resisting phone urges">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold">{willpowerPoints}</span>
            <span className="hidden sm:inline text-amber-800/80">Phone Urges Resisted</span>
          </div>

          <button
            onClick={() => setActiveTab('timer')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Start 25m Sprint</span>
          </button>
        </div>

      </div>
    </header>
  );
};
