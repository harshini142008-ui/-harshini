/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeSection } from './components/HomeSection';
import { PlanGeneratorSection } from './components/PlanGeneratorSection';
import { FocusTimerSection } from './components/FocusTimerSection';
import { ProgressSection } from './components/ProgressSection';
import {
  StudentProfile,
  StudyPlan,
  CompletedSession,
} from './types';
import {
  loadStudentProfile,
  saveStudentProfile,
  loadStudyPlan,
  saveStudyPlan,
  loadCompletedSessions,
  saveCompletedSessions,
  loadWillpowerPoints,
  saveWillpowerPoints,
  generateDailyTimetable,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'plan' | 'timer' | 'progress'>('home');
  const [profile, setProfile] = useState<StudentProfile>(loadStudentProfile);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() => {
    const saved = loadStudyPlan();
    if (saved) return saved;
    const initial = generateDailyTimetable(loadStudentProfile());
    saveStudyPlan(initial);
    return initial;
  });
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>(loadCompletedSessions);
  const [willpowerPoints, setWillpowerPoints] = useState<number>(loadWillpowerPoints);
  const [timerSubject, setTimerSubject] = useState<string>('');

  // Persist profile
  useEffect(() => {
    saveStudentProfile(profile);
  }, [profile]);

  // Persist plan
  useEffect(() => {
    if (studyPlan) {
      saveStudyPlan(studyPlan);
    }
  }, [studyPlan]);

  // Persist sessions
  useEffect(() => {
    saveCompletedSessions(completedSessions);
  }, [completedSessions]);

  // Persist willpower score
  useEffect(() => {
    saveWillpowerPoints(willpowerPoints);
  }, [willpowerPoints]);

  // Handler when user clicks "Start Timer" on a specific timetable slot
  const handleSelectSlotForFocus = (subjectName: string) => {
    setTimerSubject(subjectName);
    setActiveTab('timer');
  };

  // Handler when 25m session finishes
  const handleSessionComplete = (newSession: CompletedSession) => {
    setCompletedSessions((prev) => [newSession, ...prev]);
    setWillpowerPoints((prev) => prev + 2); // reward +2 points for finished sprint
    setActiveTab('progress');
  };

  // Handler to delete session
  const handleDeleteSession = (id: string) => {
    setCompletedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Handler to manually add session
  const handleAddManualSession = (newSession: CompletedSession) => {
    setCompletedSessions((prev) => [newSession, ...prev]);
  };

  // Increment willpower
  const handleIncrementWillpower = () => {
    setWillpowerPoints((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        willpowerPoints={willpowerPoints}
      />

      {/* Main Content Area with bottom padding for mobile bar */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <HomeSection
            onGetStarted={() => setActiveTab('plan')}
            onStartFocus={() => setActiveTab('timer')}
          />
        )}

        {activeTab === 'plan' && (
          <PlanGeneratorSection
            profile={profile}
            setProfile={setProfile}
            studyPlan={studyPlan}
            setStudyPlan={setStudyPlan}
            onSelectSlotForFocus={handleSelectSlotForFocus}
          />
        )}

        {activeTab === 'timer' && (
          <FocusTimerSection
            currentSubject={timerSubject}
            subjects={profile.subjects}
            onSessionComplete={handleSessionComplete}
            willpowerPoints={willpowerPoints}
            onIncrementWillpower={handleIncrementWillpower}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressSection
            completedSessions={completedSessions}
            onDeleteSession={handleDeleteSession}
            onAddManualSession={handleAddManualSession}
            willpowerPoints={willpowerPoints}
            dailyGoalHours={profile.dailyHours}
            subjects={profile.subjects}
          />
        )}
      </main>

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">FocusAI</span>
            <span>—</span>
            <span>Tackling college phone distractions with 25-minute Pomodoro study sprints.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-slate-900 transition-colors"
            >
              Problem &amp; Solution
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className="hover:text-slate-900 transition-colors"
            >
              Study Plan
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className="hover:text-slate-900 transition-colors"
            >
              Focus Mode
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className="hover:text-slate-900 transition-colors"
            >
              Progress
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Anchor */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
