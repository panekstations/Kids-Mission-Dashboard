// ============================================================
// AppContext — global state management with JSON file sync
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { AppState, DayRecord, MorningRoutineStep } from '../types';
import {
  loadState, saveState, todayString, msUntilNextMidnight, DEFAULT_TIMEZONE, calculateLevel,
  xpForCurrentLevel, DAILY_ALLOWANCE, XP_REWARDS,
  checkAchievements, calculateStreak, computeDayTotals,
  MATH_QUIZ_QUESTION_COUNT, resolveMathQuestionCount,
  getMorningRoutine, isMorningRoutineComplete,
  exportData as exportDataFn, importData as importDataFn,
} from '../utils/storage';
import { createDefaultState, getHelperTaskForDate } from '../data/defaults';

export interface DayRecordUpdates {
  tasks?: Partial<DayRecord['tasks']>;
  morningRoutine?: Partial<DayRecord['morningRoutine']>;
  readingMinutes?: number;
  mathScore?: number;
}

interface AppContextValue {
  state: AppState;
  today: string;
  todayRecord: DayRecord;
  isLoading: boolean;
  // Mission actions
  completeMorningRoutineStep: (step: MorningRoutineStep) => void;
  completeHelpFamily: () => void;
  addReadingMinutes: (mins: number) => void;
  completeMath: (score: number) => void;
  /** Parent admin: edit any past (or today) day */
  updateDayRecord: (date: string, updates: DayRecordUpdates) => void;
  // Allowance
  adjustAllowance: (amount: number) => void;
  // Savings
  addSavingsGoal: (name: string, target: number) => void;
  updateSavingsGoal: (id: string, progress: number) => void;
  deleteSavingsGoal: (id: string) => void;
  // Settings
  updateSettings: (partial: Partial<AppState['settings']>) => void;
  // Data
  exportData: () => string;
  importData: (json: string) => boolean;
  // Force refresh
  refreshState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function createEmptyDayRecord(date: string, helperTask: string): DayRecord {
  return {
    date,
    tasks: { makeBed: false, helpFamily: false, reading: false, math: false },
    morningRoutine: { makeBed: false, getDressed: false, brushTeeth: false },
    readingMinutes: 0,
    mathScore: 0,
    xpEarned: 0,
    allowanceEarned: 0,
    completionTimestamps: {},
    helperTaskName: helperTask,
  };
}

function resolveHelperTaskForRecord(
  record: DayRecord,
  date: string,
  settings: AppState['settings'],
): DayRecord {
  const liveTask = getHelperTaskForDate(
    settings.helperTasks,
    date,
    settings.dailyHelperTasks,
    settings.weekdayHelperTasks,
  );
  if (!record.tasks.helpFamily) {
    return { ...record, helperTaskName: liveTask };
  }
  return record;
}

function helperTaskForDay(settings: AppState['settings'], date: string): string {
  return getHelperTaskForDate(
    settings.helperTasks,
    date,
    settings.dailyHelperTasks,
    settings.weekdayHelperTasks,
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [today, setToday] = useState(() => todayString(DEFAULT_TIMEZONE));
  const timezone = state?.settings.timezone || DEFAULT_TIMEZONE;

  useEffect(() => {
    loadState().then(loaded => {
      setState(loaded);
      setToday(todayString(loaded.settings.timezone || DEFAULT_TIMEZONE));
      setIsLoading(false);
    });
  }, []);

  /** Roll over to the new calendar day at midnight in the selected timezone */
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const syncToday = () => {
      const next = todayString(timezone);
      setToday(prev => (prev === next ? prev : next));
    };

    const scheduleMidnight = () => {
      const delay = msUntilNextMidnight(timezone);
      timeoutId = setTimeout(() => {
        syncToday();
        scheduleMidnight();
      }, delay + 100); // small buffer past midnight
    };

    syncToday();
    scheduleMidnight();
    const intervalId = setInterval(syncToday, 60_000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') syncToday();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', syncToday);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', syncToday);
    };
  }, [timezone]);

  /** Keep today's stored helper task in sync with settings when not yet completed */
  useEffect(() => {
    if (!state) return;
    const record = state.history[today];
    if (!record || record.tasks.helpFamily) return;
    const taskName = helperTaskForDay(state.settings, today);
    if (record.helperTaskName === taskName) return;
    setState(prev => {
      if (!prev) return prev;
      const next = {
        ...prev,
        history: {
          ...prev.history,
          [today]: { ...record, helperTaskName: taskName },
        },
      };
      saveState(next);
      return next;
    });
  }, [state, today]);

  const todayRecord: DayRecord = useMemo(() => {
    if (!state) {
      return createEmptyDayRecord(today, 'Help the Family');
    }
    const base = state.history[today]
      ?? createEmptyDayRecord(today, helperTaskForDay(state.settings, today));
    return resolveHelperTaskForRecord(base, today, state.settings);
  }, [state, today]);

  const getTodayRecordFromState = useCallback((s: AppState): DayRecord => {
    const base = s.history[today] ?? createEmptyDayRecord(today, helperTaskForDay(s.settings, today));
    return resolveHelperTaskForRecord(base, today, s.settings);
  }, [today]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  /** Apply XP and update level/streak/allowance when missions change */
  const syncDayRecord = useCallback((record: DayRecord, prevRecord: DayRecord | null, date: string) => {
    return (prev: AppState): AppState => {
      const xpDelta = record.xpEarned - (prevRecord?.xpEarned ?? 0);
      const newTotalXP = prev.totalXP + xpDelta;

      const allComplete = Object.values(record.tasks).every(Boolean);
      const prevAllComplete = prevRecord ? Object.values(prevRecord.tasks).every(Boolean) : false;
      const allowanceDelta = (allComplete && !prevAllComplete) ? DAILY_ALLOWANCE
        : (!allComplete && prevAllComplete) ? -DAILY_ALLOWANCE : 0;
      const newBalance = +(prev.allowanceBalance + allowanceDelta).toFixed(2);
      const newLifetime = +(prev.lifetimeAllowanceEarned + allowanceDelta).toFixed(2);
      const updatedRecord = {
        ...record,
        allowanceEarned: allComplete ? DAILY_ALLOWANCE : 0,
      };

      const newHistory = { ...prev.history, [date]: updatedRecord };
      const { current, longest } = calculateStreak(newHistory, today);
      const level = calculateLevel(newTotalXP);
      const updatedAvatars = prev.avatarUnlocks.map(a =>
        !a.unlockedAt && level >= a.unlockedAtLevel
          ? { ...a, unlockedAt: new Date().toISOString() }
          : a
      );

      const next: AppState = {
        ...prev,
        history: newHistory,
        totalXP: newTotalXP,
        allowanceBalance: newBalance,
        lifetimeAllowanceEarned: newLifetime,
        currentStreak: current,
        longestStreak: Math.max(longest, prev.longestStreak),
        avatarUnlocks: updatedAvatars,
        lastUpdatedDate: today,
      };

      checkAchievements(next, today);
      return next;
    };
  }, [today]);

  /** Rebuild global stats after admin edits a day record */
  const applyDayRecordEdit = useCallback((date: string, record: DayRecord, prevRecord: DayRecord | null) => {
    return (prev: AppState): AppState => {
      const newHistory = { ...prev.history, [date]: record };

      let totalXP = 0;
      let lifetimeAllowance = 0;
      for (const r of Object.values(newHistory)) {
        totalXP += r.xpEarned;
        lifetimeAllowance += r.allowanceEarned;
      }

      const allowanceDelta = record.allowanceEarned - (prevRecord?.allowanceEarned ?? 0);
      const { current, longest } = calculateStreak(newHistory, today);
      const level = calculateLevel(totalXP);
      const updatedAvatars = prev.avatarUnlocks.map(a =>
        !a.unlockedAt && level >= a.unlockedAtLevel
          ? { ...a, unlockedAt: new Date().toISOString() }
          : a
      );

      const next: AppState = {
        ...prev,
        history: newHistory,
        totalXP,
        allowanceBalance: Math.max(0, +(prev.allowanceBalance + allowanceDelta).toFixed(2)),
        lifetimeAllowanceEarned: lifetimeAllowance,
        currentStreak: current,
        longestStreak: Math.max(longest, prev.longestStreak),
        avatarUnlocks: updatedAvatars,
        lastUpdatedDate: today,
      };

      checkAchievements(next, today);
      return next;
    };
  }, [today]);

  const completeMorningRoutineStep = useCallback((step: MorningRoutineStep) => {
    if (!state) return;
    const prev = getTodayRecordFromState(state);
    const currentSteps = getMorningRoutine(prev);
    if (currentSteps[step]) return;

    const newSteps = { ...currentSteps, [step]: true };
    const wasComplete = prev.tasks.makeBed;
    const nowComplete = isMorningRoutineComplete(newSteps);
    const xpDelta = (nowComplete && !wasComplete) ? XP_REWARDS.makeBed : 0;
    const now = new Date().toISOString();

    const updated: DayRecord = {
      ...prev,
      morningRoutine: newSteps,
      tasks: { ...prev.tasks, makeBed: nowComplete },
      xpEarned: prev.xpEarned + xpDelta,
      completionTimestamps: {
        ...prev.completionTimestamps,
        morningRoutine: {
          ...prev.completionTimestamps.morningRoutine,
          [step]: now,
        },
        ...(nowComplete && !wasComplete ? { makeBed: now } : {}),
      },
    };
    updateState(syncDayRecord(updated, prev, today));
  }, [state, today, updateState, syncDayRecord, getTodayRecordFromState]);

  const completeHelpFamily = useCallback(() => {
    if (!state) return;
    const prev = getTodayRecordFromState(state);
    if (prev.tasks.helpFamily) return;
    const updated: DayRecord = {
      ...prev,
      tasks: { ...prev.tasks, helpFamily: true },
      helperTaskName: prev.helperTaskName ?? helperTaskForDay(state.settings, today),
      xpEarned: prev.xpEarned + XP_REWARDS.helpFamily,
      completionTimestamps: { ...prev.completionTimestamps, helpFamily: new Date().toISOString() },
    };
    updateState(syncDayRecord(updated, prev, today));
  }, [state, today, updateState, syncDayRecord, getTodayRecordFromState]);

  const addReadingMinutes = useCallback((mins: number) => {
    if (!state) return;
    const prev = getTodayRecordFromState(state);
    const newMins = prev.readingMinutes + mins;
    const goalMet = newMins >= state.settings.dailyReadingGoal;
    const wasAlreadyMet = prev.readingMinutes >= state.settings.dailyReadingGoal;
    const xpDelta = (goalMet && !wasAlreadyMet) ? XP_REWARDS.reading : 0;
    const updated: DayRecord = {
      ...prev,
      readingMinutes: newMins,
      tasks: { ...prev.tasks, reading: goalMet || prev.tasks.reading },
      xpEarned: prev.xpEarned + xpDelta,
      completionTimestamps: {
        ...prev.completionTimestamps,
        ...(goalMet && !prev.tasks.reading ? { reading: new Date().toISOString() } : {}),
      },
    };
    updateState(syncDayRecord(updated, prev, today));
  }, [state, today, updateState, syncDayRecord, getTodayRecordFromState]);

  const completeMath = useCallback((score: number) => {
    if (!state) return;
    const prev = getTodayRecordFromState(state);
    if (prev.tasks.math) return;
    const isPerfect = score === MATH_QUIZ_QUESTION_COUNT;
    const xpDelta = XP_REWARDS.math + (isPerfect ? XP_REWARDS.perfectMath : 0);
    const updated: DayRecord = {
      ...prev,
      tasks: { ...prev.tasks, math: true },
      mathScore: score,
      mathQuestionCount: MATH_QUIZ_QUESTION_COUNT,
      xpEarned: prev.xpEarned + xpDelta,
      mathPerfect: isPerfect,
      completionTimestamps: { ...prev.completionTimestamps, math: new Date().toISOString() },
    };
    updateState(syncDayRecord(updated, prev, today));
  }, [state, today, updateState, syncDayRecord, getTodayRecordFromState]);

  const updateDayRecord = useCallback((date: string, updates: DayRecordUpdates) => {
    if (!state) return;
    if (date > today) return;

    updateState(prev => {
      const helperTask = helperTaskForDay(prev.settings, date);
      const prevRecord = prev.history[date] ?? createEmptyDayRecord(date, helperTask);

      const tasks = { ...prevRecord.tasks, ...updates.tasks };
      const morningRoutine = {
        ...getMorningRoutine(prevRecord),
        ...updates.morningRoutine,
      };
      const routineComplete = isMorningRoutineComplete(morningRoutine);
      tasks.makeBed = routineComplete;

      const readingMinutes = updates.readingMinutes ?? prevRecord.readingMinutes;
      const mathScore = updates.mathScore ?? prevRecord.mathScore;
      const readingGoal = prev.settings.dailyReadingGoal;

      if (readingMinutes >= readingGoal) tasks.reading = true;

      const mathQuestionCount = resolveMathQuestionCount(prevRecord, mathScore);

      const { xpEarned, allowanceEarned, mathPerfect } = computeDayTotals(
        tasks, readingMinutes, mathScore, readingGoal, mathQuestionCount, morningRoutine,
      );

      const updatedRecord: DayRecord = {
        ...prevRecord,
        date,
        tasks,
        morningRoutine,
        readingMinutes,
        mathScore,
        mathQuestionCount,
        xpEarned,
        allowanceEarned,
        mathPerfect,
        helperTaskName: tasks.helpFamily ? (prevRecord.helperTaskName ?? helperTask) : helperTask,
      };

      return applyDayRecordEdit(date, updatedRecord, prevRecord)(prev);
    });
  }, [state, today, updateState, applyDayRecordEdit]);

  const adjustAllowance = useCallback((amount: number) => {
    updateState(prev => ({
      ...prev,
      allowanceBalance: Math.max(0, +(prev.allowanceBalance + amount).toFixed(2)),
    }));
  }, [updateState]);

  const addSavingsGoal = useCallback((name: string, target: number) => {
    updateState(prev => ({
      ...prev,
      savingsGoals: [
        ...prev.savingsGoals,
        { id: Date.now().toString(), name, targetCost: target, currentProgress: 0, createdAt: new Date().toISOString() },
      ],
    }));
  }, [updateState]);

  const updateSavingsGoal = useCallback((id: string, progress: number) => {
    updateState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g =>
        g.id === id ? { ...g, currentProgress: Math.min(progress, g.targetCost) } : g
      ),
    }));
  }, [updateState]);

  const deleteSavingsGoal = useCallback((id: string) => {
    updateState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id),
    }));
  }, [updateState]);

  const updateSettings = useCallback((partial: Partial<AppState['settings']>) => {
    updateState(prev => {
      const newSettings = { ...prev.settings, ...partial };
      const todayEntry = prev.history[today];
      if (todayEntry?.tasks.helpFamily) {
        return { ...prev, settings: newSettings };
      }
      const taskName = helperTaskForDay(newSettings, today);
      const updatedToday = {
        ...(todayEntry ?? createEmptyDayRecord(today, taskName)),
        helperTaskName: taskName,
      };
      return {
        ...prev,
        settings: newSettings,
        history: { ...prev.history, [today]: updatedToday },
      };
    });
  }, [today, updateState]);

  const exportDataFnCb = useCallback(() => {
    if (!state) return exportDataFn(createDefaultState());
    return exportDataFn(state);
  }, [state]);

  const importDataFnCb = useCallback((json: string): boolean => {
    const parsed = importDataFn(json);
    if (!parsed) return false;
    setState(parsed);
    saveState(parsed);
    return true;
  }, []);

  const refreshState = useCallback(() => {
    loadState().then(setState);
  }, []);

  if (isLoading || !state) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-3">🚀</div>
          <div className="font-bold">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const value: AppContextValue = {
    state,
    today,
    todayRecord,
    isLoading,
    completeMorningRoutineStep,
    completeHelpFamily,
    addReadingMinutes,
    completeMath,
    updateDayRecord,
    adjustAllowance,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateSettings,
    exportData: exportDataFnCb,
    importData: importDataFnCb,
    refreshState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Derived selectors */
export function useXP() {
  const { state } = useApp();
  return {
    totalXP: state.totalXP,
    level: calculateLevel(state.totalXP),
    xpInLevel: xpForCurrentLevel(state.totalXP),
  };
}
