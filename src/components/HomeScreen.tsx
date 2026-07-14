// ============================================================
// HomeScreen — main child-facing dashboard
// ============================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { ProgressRing } from './ProgressRing';
import { MissionTile } from './MissionTile';
import { MathQuiz } from './MathQuiz';
import { MissionComplete } from './MissionComplete';
import { StatusBar, SevenDayStrip } from './StatusBar';
import { WeatherForecast } from './WeatherForecast';
import { AchievementsScreen } from './ExtraScreens';
import { dayOfWeek, getMathQuestionCount, getMorningRoutine, MORNING_ROUTINE_STEPS } from '../utils/storage';
import { getTheme } from '../data/themes';
import { X } from 'lucide-react';

interface HomeScreenProps {
  onOpenAdmin: () => void;
}

export function HomeScreen({ onOpenAdmin }: HomeScreenProps) {
  const { state, today, todayRecord, completeMorningRoutineStep, completeHelpFamily, addReadingMinutes, completeMath } = useApp();
  const { settings } = state;
  const theme = getTheme(settings.theme);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  const unlockedBadgeCount = state.achievements.filter(a => a.unlockedAt).length;

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // New calendar day: clear day-specific UI
  useEffect(() => {
    setShowCelebration(false);
    setShowMathQuiz(false);
    setShowBadges(false);
  }, [today]);

  // Count completed missions
  const completedCount = [
    todayRecord.tasks.makeBed,
    todayRecord.tasks.helpFamily,
    todayRecord.tasks.reading,
    todayRecord.tasks.math,
  ].filter(Boolean).length;

  const allComplete = completedCount === 4;
  const progress = completedCount / 4;

  // Show celebration when all missions are first completed
  useEffect(() => {
    if (allComplete) setShowCelebration(true);
  }, [allComplete]);

  // Secret admin access: tap the title 5 times
  const handleTitleTap = () => {
    const next = adminTapCount + 1;
    setAdminTapCount(next);
    if (next >= 5) {
      setAdminTapCount(0);
      onOpenAdmin();
    }
  };

  const readingGoal = settings.dailyReadingGoal;
  const readingProgress = Math.min(todayRecord.readingMinutes / readingGoal, 1);

  return (
    <div className="h-full flex flex-col overflow-hidden"
         style={{ background: theme.background }}>

      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-black/30 backdrop-blur border-b border-white/10">
        <button onClick={handleTitleTap} className="text-left flex-shrink-0">
          <div className="text-white font-black text-[1.3125rem] leading-tight" style={{ fontFamily: 'Fredoka One, cursive' }}>
            {settings.childName}'s Dashboard
          </div>
          <div className="text-white/50 text-lg leading-tight">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', timeZone: settings.timezone,
            })}
          </div>
        </button>

        <div className="flex-1 flex justify-center min-w-0">
          <WeatherForecast />
        </div>

        <div className="flex items-center text-xs flex-shrink-0">
          <div className="text-center">
            <div className="text-white font-black text-[1.6875rem] leading-none">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', timeZone: settings.timezone,
              })}
            </div>
            <div className="text-white/50 text-lg">now</div>
          </div>
        </div>
      </div>

      {/* MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="p-4 space-y-4">
          {/* TODAY HEADER + PROGRESS RING */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`${theme.pageTitle} font-black text-3xl leading-tight`}
                  style={{ fontFamily: 'Fredoka One, cursive' }}>
                TODAY IS<br />
                <span className={theme.accentText}>{dayOfWeek(today)}</span>
              </h1>
              <p className={`${theme.pageMuted} text-sm mt-1`}>
                {allComplete ? "All missions complete! Great job!" : "Complete today's missions!"}
              </p>
            </div>

            <ProgressRing progress={progress} size={120} strokeWidth={10} color={theme.accent}>
              <div className="text-center">
                <div className={`${theme.pageTitle} font-black text-2xl`} style={{ fontFamily: 'Fredoka One, cursive' }}>
                  {completedCount}<span className={`${theme.pageMuted} text-base`}>/4</span>
                </div>
                <div className={`${theme.pageMuted} text-xs`}>done</div>
              </div>
            </ProgressRing>
          </div>

          <div className={`${theme.pageMuted} text-xs text-center font-bold tracking-widest`}>
            {completedCount} OF 4 MISSIONS COMPLETE
          </div>

          <button
            onClick={() => setShowBadges(true)}
            className={`w-full py-3 font-black rounded-2xl text-base active:scale-95 transition-all ${theme.accentButton}`}
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            🏅 My Badges ({unlockedBadgeCount}/{state.achievements.length})
          </button>

          {allComplete && !showCelebration && (
            <button
              onClick={() => setShowCelebration(true)}
              className={`w-full py-2 font-bold rounded-xl text-sm active:scale-95 transition-all ${theme.accentButton}`}
            >
              🏆 See Celebration Again
            </button>
          )}

          {/* 2x2 MISSION GRID */}
          <div className="grid grid-cols-2 gap-3">

            {/* Mission 1: Morning Routine */}
            <MissionTile
              title="Morning Routine"
              icon="🌅"
              xpReward={5}
              isComplete={todayRecord.tasks.makeBed}
              color={theme.missionMorning}
              xpClass="text-yellow-200"
            >
              <div className="mt-auto flex gap-1">
                {MORNING_ROUTINE_STEPS.map(step => {
                  const routine = getMorningRoutine(todayRecord);
                  const done = routine[step.key];
                  return (
                    <div key={step.key} className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <div className={`text-base font-bold text-center leading-tight ${done ? 'text-green-300' : 'text-white'}`}>
                        {step.label}
                      </div>
                      {done ? (
                        <div className="w-full py-2 bg-green-400/30 text-green-200 font-black text-sm rounded-xl text-center">
                          ✓ Done
                        </div>
                      ) : (
                        <button
                          onClick={() => completeMorningRoutineStep(step.key)}
                          className="w-full py-2 bg-white/20 hover:bg-white/30 text-white font-black text-sm rounded-xl
                                     active:scale-95 transition-all"
                        >
                          Mark as Done
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </MissionTile>

            {/* Mission 2: Help Family */}
            <MissionTile
              title="Help Family"
              icon="🤝"
              xpReward={5}
              isComplete={todayRecord.tasks.helpFamily}
              timestamp={todayRecord.completionTimestamps.helpFamily}
              onComplete={completeHelpFamily}
              color={theme.missionHelp}
              xpClass="text-yellow-200"
            >
              <div className="flex flex-col flex-1">
                <div className="text-white text-base font-bold">
                  Today: {todayRecord.helperTaskName}
                </div>
                {!todayRecord.tasks.helpFamily && (
                  <button
                    onClick={completeHelpFamily}
                    className={`mt-auto w-full py-2 text-white font-black text-sm
                               rounded-xl active:scale-95 transition-all ${theme.helpButton}`}
                  >
                    Mark as Done
                  </button>
                )}
              </div>
            </MissionTile>

            {/* Mission 3: Reading */}
            <MissionTile
              title="Reading"
              icon="📚"
              xpReward={10}
              isComplete={todayRecord.tasks.reading}
              timestamp={todayRecord.completionTimestamps.reading}
              color={theme.missionReading}
              xpClass="text-yellow-200"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-white text-sm">
                  <span>{todayRecord.readingMinutes} min</span>
                  <span className="text-white/60">goal: {readingGoal} min</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${theme.readingBar}`}
                    style={{ width: `${Math.min(readingProgress * 100, 100)}%` }}
                  />
                </div>
                {!todayRecord.tasks.reading && (
                  <div className="flex gap-1">
                    {[5, 10, 20].map(mins => (
                      <button
                        key={mins}
                        onClick={() => addReadingMinutes(mins)}
                        className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white font-black 
                                   text-sm rounded-xl active:scale-95 transition-all"
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </MissionTile>

            {/* Mission 4: Math */}
            <MissionTile
              title="Math Quiz"
              icon="🧮"
              xpReward={todayRecord.mathPerfect ? 20 : 10}
              isComplete={todayRecord.tasks.math}
              timestamp={todayRecord.completionTimestamps.math}
              color={theme.missionMath}
              xpClass="text-yellow-200"
            >
              <div className="flex flex-col flex-1">
                {todayRecord.tasks.math ? (
                  <div className="mt-auto text-white font-bold text-sm">
                    Score: {todayRecord.mathScore}/{getMathQuestionCount(todayRecord)}{' '}
                    {todayRecord.mathPerfect && <span>🌟 Perfect!</span>}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMathQuiz(true)}
                    className={`mt-auto w-full py-2 text-white font-black text-sm
                               rounded-xl active:scale-95 transition-all ${theme.mathButton}`}
                  >
                    Take Math Test
                  </button>
                )}
              </div>
            </MissionTile>
          </div>
        </div>

        {allComplete && showCelebration && (
          <MissionComplete
            soundEnabled={settings.soundEnabled}
            onDismiss={() => setShowCelebration(false)}
          />
        )}
      </div>

      {/* 7 DAY STRIP */}
      <SevenDayStrip />

      {/* STATUS BAR */}
      <StatusBar />

      {/* Math Quiz Modal */}
      {showMathQuiz && (
        <MathQuiz
          difficulty={settings.mathDifficulty}
          onComplete={(score) => {
            completeMath(score);
            setShowMathQuiz(false);
          }}
          onClose={() => setShowMathQuiz(false)}
        />
      )}

      {/* Badges Modal */}
      {showBadges && (
        <div className="fixed inset-0 z-50 flex flex-col"
             style={{ background: theme.background }}>
          <div className="flex justify-end px-4 py-3 bg-black/30 border-b border-white/10">
            <button
              onClick={() => setShowBadges(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white
                         font-bold rounded-xl active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AchievementsScreen title="🏅 My Badges" />
          </div>
        </div>
      )}
    </div>
  );
}
