import React from 'react';
import { Home, CalendarClock, Timer, Award } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'plan' | 'timer' | 'progress';
  setActiveTab: (tab: 'home' | 'plan' | 'timer' | 'progress') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'plan' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Study Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'timer' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'timer' ? 'bg-indigo-50' : ''}`}>
            <Timer className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">Focus</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'progress' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Progress</span>
        </button>
      </div>
    </div>
  );
};
