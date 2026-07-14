// ============================================================
// JSON file persistence (via /api/state) + date utilities
// ============================================================

import type { AppState, DayRecord, MorningRoutineSteps, MorningRoutineStep } from '../types';
import { createDefaultState, normalizeWeekdayHelperTasks } from '../data/defaults';

const STORAGE_KEY = 'kids_mission_dashboard_v1';
const LEGACY_STORAGE_KEY = 'nathans_mission_dashboard_v1';
/** @deprecated Prefer settings.timezone — kept as default fallback */
export const CHICAGO_TZ = 'America/Chicago';
export const DEFAULT_TIMEZONE = 'America/Chicago';

function mergeWithDefaults(parsed: Partial<AppState>): AppState {
  const defaults = createDefaultState();
  const mergedSettings = { ...defaults.settings, ...(parsed.settings ?? {}) };
  return {
    ...defaults,
    ...parsed,
    settings: {
      ...mergedSettings,
      weekdayHelperTasks: normalizeWeekdayHelperTasks(
        parsed.settings?.weekdayHelperTasks,
        mergedSettings.helperTasks,
      ),
      weatherZip: mergedSettings.weatherZip || defaults.settings.weatherZip,
      timezone: mergedSettings.timezone || defaults.settings.timezone,
      theme: mergedSettings.theme || defaults.settings.theme,
      nightDimMode: mergedSettings.nightDimMode || defaults.settings.nightDimMode,
      nightDimStart: mergedSettings.nightDimStart || defaults.settings.nightDimStart,
      nightDimEnd: mergedSettings.nightDimEnd || defaults.settings.nightDimEnd,
    },
    achievements: parsed.achievements ?? defaults.achievements,
    avatarUnlocks: parsed.avatarUnlocks ?? defaults.avatarUnlocks,
    savingsGoals: parsed.savingsGoals ?? defaults.savingsGoals,
    history: parsed.history ?? {},
  };
}

/** Migrate legacy localStorage data to the JSON file on first load */
function loadLegacyLocalStorage(): AppState | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return mergeWithDefaults(parsed);
  } catch {
    return null;
  }
}

/** Load state from data/dashboard.json via API, merging with defaults */
export async function loadState(): Promise<AppState> {
  try {
    const res = await fetch('/api/state');
    if (res.ok) {
      const parsed = (await res.json()) as Partial<AppState>;
      if (parsed && (parsed.settings || parsed.history)) {
        return mergeWithDefaults(parsed);
      }
    }
  } catch (e) {
    console.warn('Could not load from API, checking localStorage:', e);
  }

  const legacy = loadLegacyLocalStorage();
  if (legacy) {
    await saveState(legacy);
    return legacy;
  }

  return createDefaultState();
}

/** Save full state to data/dashboard.json via API */
export async function saveState(state: AppState): Promise<void> {
  try {
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

/** Export all data as JSON string */
export function exportData(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

/** Import and validate JSON data */
export function importData(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json) as Partial<AppState>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.settings || !parsed.history) return null;
    return mergeWithDefaults(parsed);
  } catch {
    return null;
  }
}

// ============================================================
// Date utilities (timezone-aware)
// ============================================================

/** Format a Date as "YYYY-MM-DD" in the given IANA timezone */
export function formatDateInTimezone(d: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** @deprecated Use formatDateInTimezone */
export function formatDateInChicago(d: Date = new Date()): string {
  return formatDateInTimezone(d, DEFAULT_TIMEZONE);
}

/** Get today's date as "YYYY-MM-DD" in the given timezone */
export function todayString(timeZone: string = DEFAULT_TIMEZONE): string {
  return formatDateInTimezone(new Date(), timeZone);
}

/**
 * Milliseconds until the next midnight in the given IANA timezone.
 * Uses a short binary search so DST transitions stay accurate.
 */
export function msUntilNextMidnight(timeZone: string = DEFAULT_TIMEZONE, from: Date = new Date()): number {
  const tomorrow = addDays(formatDateInTimezone(from, timeZone), 1);
  let lo = from.getTime();
  let hi = from.getTime() + 36 * 60 * 60 * 1000; // enough to clear DST long days
  while (hi - lo > 250) {
    const mid = Math.floor((lo + hi) / 2);
    if (formatDateInTimezone(new Date(mid), timeZone) < tomorrow) lo = mid;
    else hi = mid;
  }
  return Math.max(hi - from.getTime(), 1000);
}

/** @deprecated Use msUntilNextMidnight */
export function msUntilNextChicagoMidnight(from: Date = new Date()): number {
  return msUntilNextMidnight(DEFAULT_TIMEZONE, from);
}

/** @deprecated Use formatDateInTimezone — kept for internal calendar math */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Add days to a "YYYY-MM-DD" string */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/** Parse "YYYY-MM-DD" to a Date at local midnight */
export function parseDate(s: string): Date {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
}

/** Days until a target date (based on timezone calendar days) */
export function daysUntil(targetDateStr: string, timeZone: string = DEFAULT_TIMEZONE): number {
  const today = parseDate(todayString(timeZone));
  today.setHours(0, 0, 0, 0);
  const target = parseDate(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Next birthday (handles past this year) */
export function nextBirthdayDate(birthdayStr: string, timeZone: string = DEFAULT_TIMEZONE): string {
  if (!birthdayStr) return '';
  const today = parseDate(todayString(timeZone));
  const [, m, day] = birthdayStr.split('-').map(Number);
  let year = today.getFullYear();
  const candidate = new Date(year, m - 1, day);
  candidate.setHours(0, 0, 0, 0);
  if (candidate <= today) year += 1;
  return formatDate(new Date(year, m - 1, day));
}

/** Day of week name */
export function dayOfWeek(dateStr: string): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[parseDate(dateStr).getDay()];
}

/** Get last N days as "YYYY-MM-DD" strings, oldest first. Pass app `today` when available. */
export function lastNDays(n: number, today: string = todayString()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, -(n - 1 - i)));
}

/** Get all dates in a month as "YYYY-MM-DD" strings */
export function datesInMonth(year: number, month: number): string[] {
  const result: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    result.push(dateStr);
  }
  return result;
}

// ============================================================
// XP and level calculations
// ============================================================

export const XP_REWARDS = {
  makeBed: 5,
  helpFamily: 5,
  reading: 10,
  math: 10,
  perfectMath: 10,
};

export const MORNING_ROUTINE_STEPS: Array<{ key: MorningRoutineStep; label: string; shortLabel: string }> = [
  { key: 'makeBed', label: 'Make Bed', shortLabel: 'Bed' },
  { key: 'getDressed', label: 'Get Dressed', shortLabel: 'Dress' },
  { key: 'brushTeeth', label: 'Brush Teeth', shortLabel: 'Teeth' },
];

const EMPTY_MORNING_ROUTINE: MorningRoutineSteps = {
  makeBed: false,
  getDressed: false,
  brushTeeth: false,
};

/** Get morning routine steps, migrating legacy makeBed-only records */
export function getMorningRoutine(record: Pick<DayRecord, 'tasks' | 'morningRoutine'>): MorningRoutineSteps {
  if (record.morningRoutine) return record.morningRoutine;
  if (record.tasks.makeBed) {
    return { makeBed: true, getDressed: true, brushTeeth: true };
  }
  return { ...EMPTY_MORNING_ROUTINE };
}

export function isMorningRoutineComplete(steps: MorningRoutineSteps): boolean {
  return steps.makeBed && steps.getDressed && steps.brushTeeth;
}

export const MATH_QUIZ_QUESTION_COUNT = 10;
export const LEGACY_MATH_QUIZ_QUESTION_COUNT = 5;

/** Question count for a day record (historical quizzes default to 5) */
export function getMathQuestionCount(record?: Pick<DayRecord, 'mathQuestionCount'>): number {
  return record?.mathQuestionCount ?? LEGACY_MATH_QUIZ_QUESTION_COUNT;
}

/** Resolve question count when editing a record without an explicit count */
export function resolveMathQuestionCount(record: DayRecord, mathScore: number): number {
  if (record.mathQuestionCount != null) return record.mathQuestionCount;
  if (mathScore > LEGACY_MATH_QUIZ_QUESTION_COUNT) return MATH_QUIZ_QUESTION_COUNT;
  return LEGACY_MATH_QUIZ_QUESTION_COUNT;
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

export function xpForCurrentLevel(totalXP: number): number {
  return totalXP % 100;
}

export function xpNeededForNextLevel(totalXP: number): number {
  return 100 - (totalXP % 100);
}

/** Compute XP and allowance for a day record from its task state */
export function computeDayTotals(
  tasks: DayRecord['tasks'],
  readingMinutes: number,
  mathScore: number,
  readingGoal: number,
  mathQuestionCount = LEGACY_MATH_QUIZ_QUESTION_COUNT,
  morningRoutine?: MorningRoutineSteps,
): { xpEarned: number; allowanceEarned: number; mathPerfect: boolean } {
  let xpEarned = 0;
  const routine = morningRoutine ?? {
    makeBed: tasks.makeBed,
    getDressed: tasks.makeBed,
    brushTeeth: tasks.makeBed,
  };
  const routineComplete = isMorningRoutineComplete(routine);
  if (routineComplete) xpEarned += XP_REWARDS.makeBed;
  if (tasks.helpFamily) xpEarned += XP_REWARDS.helpFamily;
  const readingDone = tasks.reading || readingMinutes >= readingGoal;
  if (readingDone) xpEarned += XP_REWARDS.reading;
  const mathPerfect = tasks.math && mathScore === mathQuestionCount;
  if (tasks.math) {
    xpEarned += XP_REWARDS.math;
    if (mathPerfect) xpEarned += XP_REWARDS.perfectMath;
  }
  const allComplete = routineComplete && tasks.helpFamily && readingDone && tasks.math;
  const allowanceEarned = allComplete ? DAILY_ALLOWANCE : 0;
  return { xpEarned, allowanceEarned, mathPerfect: !!mathPerfect };
}

// ============================================================
// Allowance calculations
// ============================================================

export const DAILY_ALLOWANCE = +(5.0 / 7).toFixed(2); // $0.71

export function getDayStatus(record?: DayRecord): 'complete' | 'partial' | 'missed' | 'perfect' | null {
  if (!record) return null;
  const { tasks, mathScore } = record;
  const completed = [
    isMorningRoutineComplete(getMorningRoutine(record)),
    tasks.helpFamily,
    tasks.reading,
    tasks.math,
  ].filter(Boolean).length;
  if (completed === 0) return 'missed';
  if (completed < 4) return 'partial';
  if (tasks.math && mathScore === getMathQuestionCount(record)) return 'perfect';
  return 'complete';
}

// ============================================================
// Streak calculation
// ============================================================

export function calculateStreak(history: Record<string, DayRecord>, today: string): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  let streak = 0;

  // Walk backwards from yesterday (today might not be done yet)
  let dateStr = addDays(today, -1);
  let checking = true;

  for (let i = 0; i < 365 && checking; i++) {
    const record = history[dateStr];
    const status = getDayStatus(record);
    if (status === 'complete' || status === 'perfect') {
      streak++;
    } else if (dateStr < today) {
      checking = false;
    }
    dateStr = addDays(dateStr, -1);
  }
  current = streak;

  // Calculate longest ever
  const allDates = Object.keys(history).sort();
  let running = 0;
  for (const date of allDates) {
    const status = getDayStatus(history[date]);
    if (status === 'complete' || status === 'perfect') {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  return { current, longest };
}

// ============================================================
// Math quiz generation
// ============================================================

import type { MathDifficulty, MathQuestion } from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate grade-appropriate whole-number quiz questions */
export function generateMathQuestions(difficulty: MathDifficulty): MathQuestion[] {
  const questions: MathQuestion[] = [];

  for (let i = 0; i < MATH_QUIZ_QUESTION_COUNT; i++) {
    let a: number;
    let b: number;
    let answer: number;
    let operator: '+' | '-' | '×' | '÷' = '+';

    switch (difficulty) {
      case 'kindergarten': {
        // Add within 10 (sums ≤ 10)
        operator = '+';
        a = randInt(0, 9);
        b = randInt(0, 10 - a);
        answer = a + b;
        break;
      }
      case 'grade1': {
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '+') {
          a = randInt(1, 10);
          b = randInt(1, 10);
          while (a + b > 20) {
            a = randInt(1, 10);
            b = randInt(1, 10);
          }
          answer = a + b;
        } else {
          a = randInt(5, 19);
          b = randInt(1, a);
          answer = a - b;
        }
        break;
      }
      case 'grade2': {
        const roll = Math.random();
        if (roll > 0.7) {
          operator = '×';
          a = randInt(1, 10);
          b = randInt(1, 10);
          answer = a * b;
        } else if (roll > 0.35) {
          operator = '+';
          a = randInt(10, 59);
          b = randInt(10, 59);
          answer = a + b;
        } else {
          operator = '-';
          a = randInt(20, 99);
          b = randInt(1, a);
          answer = a - b;
        }
        break;
      }
      case 'grade3': {
        const roll = Math.random();
        if (roll > 0.55) {
          operator = '×';
          a = randInt(2, 12);
          b = randInt(2, 12);
          answer = a * b;
        } else if (roll > 0.25) {
          b = randInt(2, 10);
          answer = randInt(2, 10);
          a = b * answer;
          operator = '÷';
        } else if (roll > 0.12) {
          operator = '+';
          a = randInt(50, 400);
          b = randInt(20, 300);
          answer = a + b;
        } else {
          operator = '-';
          a = randInt(50, 500);
          b = randInt(10, a);
          answer = a - b;
        }
        break;
      }
      case 'grade4': {
        const roll = Math.random();
        if (roll > 0.5) {
          operator = '×';
          a = randInt(3, 15);
          b = randInt(3, 15);
          answer = a * b;
        } else if (roll > 0.25) {
          b = randInt(2, 12);
          answer = randInt(2, 12);
          a = b * answer;
          operator = '÷';
        } else if (roll > 0.12) {
          operator = '+';
          a = randInt(100, 900);
          b = randInt(50, 500);
          answer = a + b;
        } else {
          operator = '-';
          a = randInt(200, 999);
          b = randInt(50, a);
          answer = a - b;
        }
        break;
      }
      case 'grade5':
      default: {
        const roll = Math.random();
        if (roll > 0.45) {
          operator = '×';
          a = randInt(6, 25);
          b = randInt(4, 15);
          answer = a * b;
        } else if (roll > 0.2) {
          b = randInt(3, 15);
          answer = randInt(3, 15);
          a = b * answer;
          operator = '÷';
        } else if (roll > 0.1) {
          operator = '+';
          a = randInt(200, 1500);
          b = randInt(100, 800);
          answer = a + b;
        } else {
          operator = '-';
          a = randInt(300, 2000);
          b = randInt(100, a);
          answer = a - b;
        }
        break;
      }
    }

    questions.push({
      a,
      b,
      operator,
      answer,
      display: `${a} ${operator} ${b} = ?`,
    });
  }

  return questions;
}

/** Check if an achievement should be unlocked */
export function checkAchievements(state: AppState, today: string): string[] {
  const newlyUnlocked: string[] = [];
  const hist = state.history;

  const totalReadingMins = Object.values(hist).reduce((sum, r) => sum + r.readingMinutes, 0);
  const totalBeds = Object.values(hist).filter(r => r.tasks.makeBed).length;
  const totalHelper = Object.values(hist).filter(r => r.tasks.helpFamily).length;
  const anyMissionDone = Object.values(hist).some(r =>
    r.tasks.makeBed || r.tasks.helpFamily || r.tasks.reading || r.tasks.math
  );
  const todayRecord = hist[today];
  const allComplete = todayRecord && Object.values(todayRecord.tasks).every(Boolean);
  const perfectQuiz = Object.values(hist).some(r =>
    r.tasks.math && (r.mathPerfect || r.mathScore === getMathQuestionCount(r))
  );

  const checks: Record<string, boolean> = {
    streak7: state.currentStreak >= 7,
    streak30: state.currentStreak >= 30,
    reading100: totalReadingMins >= 100,
    reading500: totalReadingMins >= 500,
    xp1000: state.totalXP >= 1000,
    xp5000: state.totalXP >= 5000,
    perfectQuiz,
    saved50: state.allowanceBalance >= 50,
    saved100: state.allowanceBalance >= 100,
    firstMission: anyMissionDone,
    firstComplete: !!allComplete,
    beds30: totalBeds >= 30,
    helper30: totalHelper >= 30,
  };

  const updated = state.achievements.map(a => {
    if (!a.unlockedAt && checks[a.id]) {
      newlyUnlocked.push(a.id);
      return { ...a, unlockedAt: new Date().toISOString() };
    }
    return a;
  });

  state.achievements = updated;
  return newlyUnlocked;
}
