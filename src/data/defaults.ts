// ============================================================
// Default state, achievements, and avatar unlocks
// ============================================================

import type {
  Achievement,
  AvatarUnlock,
  AppSettings,
  AppState,
  Weekday,
  WeekdayHelperTasks,
} from '../types';

export const WEEKDAYS: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

export const DEFAULT_WEEKDAY_HELPER_TASKS: WeekdayHelperTasks = {
  sunday: 'Set the Table',
  monday: 'Clear the Table',
  tuesday: 'Feed the Pet',
  wednesday: 'Put Away Laundry',
  thursday: 'Take Out Trash',
  friday: 'Water the Plants',
  saturday: 'Sweep the Floor',
};

/** Common US timezones for the settings picker */
export const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'America/New_York', label: 'Eastern (New York)' },
  { value: 'America/Chicago', label: 'Central (Chicago)' },
  { value: 'America/Denver', label: 'Mountain (Denver)' },
  { value: 'America/Phoenix', label: 'Arizona (Phoenix)' },
  { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
  { value: 'America/Anchorage', label: 'Alaska (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  childName: 'Alex',
  birthday: '2019-01-01',
  vacationDates: [],
  allowanceAmount: 5.00,
  dailyReadingGoal: 20,
  mathDifficulty: 'grade1',
  weatherZip: '10001',
  timezone: 'America/New_York',
  theme: 'default',
  nightDimMode: 'auto',
  nightDimStart: '21:00',
  nightDimEnd: '06:00',
  helperTasks: [
    'Set the Table',
    'Clear the Table',
    'Feed the Pet',
    'Put Away Laundry',
    'Take Out Trash',
    'Water the Plants',
    'Sweep the Floor',
    'Wipe the Counters',
  ],
  weekdayHelperTasks: { ...DEFAULT_WEEKDAY_HELPER_TASKS },
  parentPin: '1234',
  soundEnabled: true,
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'streak7',        name: '7 Day Streak',       description: 'Complete missions 7 days in a row!',   icon: '🔥' },
  { id: 'streak30',       name: '30 Day Streak',       description: 'Complete missions 30 days in a row!',  icon: '⚡' },
  { id: 'reading100',     name: 'Bookworm',            description: 'Read for 100 minutes total!',          icon: '📚' },
  { id: 'reading500',     name: 'Super Reader',        description: 'Read for 500 minutes total!',          icon: '🦉' },
  { id: 'xp1000',         name: '1000 XP',             description: 'Earn 1,000 total XP!',                 icon: '⭐' },
  { id: 'xp5000',         name: 'XP Legend',           description: 'Earn 5,000 total XP!',                 icon: '🌟' },
  { id: 'perfectQuiz',    name: 'Math Wizard',         description: 'Get a perfect score on a math quiz!',  icon: '🧙' },
  { id: 'saved50',        name: '$50 Saved',           description: 'Save your first $50!',                 icon: '💰' },
  { id: 'saved100',       name: '$100 Saved',          description: 'Save $100!',                           icon: '💎' },
  { id: 'firstMission',   name: 'Mission Started',     description: 'Complete your first mission!',         icon: '🚀' },
  { id: 'firstComplete',  name: 'All Systems Go!',     description: 'Complete all 4 missions in one day!',  icon: '🏆' },
  { id: 'beds30',         name: 'Bed Maker Pro',       description: 'Make your bed 30 times!',              icon: '🛏️' },
  { id: 'helper30',       name: 'Super Helper',        description: 'Complete 30 helper tasks!',            icon: '🤝' },
];

export const DEFAULT_AVATAR_UNLOCKS: AvatarUnlock[] = [
  { id: 'hat_star',       type: 'hat',        name: 'Star Hat',          unlockedAtLevel: 2  },
  { id: 'hat_wizard',     type: 'hat',        name: 'Wizard Hat',        unlockedAtLevel: 5  },
  { id: 'hat_crown',      type: 'hat',        name: 'Gold Crown',        unlockedAtLevel: 10 },
  { id: 'hat_superhero',  type: 'hat',        name: 'Superhero Mask',    unlockedAtLevel: 20 },
  { id: 'trophy_bronze',  type: 'trophy',     name: 'Bronze Trophy',     unlockedAtLevel: 2  },
  { id: 'trophy_silver',  type: 'trophy',     name: 'Silver Trophy',     unlockedAtLevel: 5  },
  { id: 'trophy_gold',    type: 'trophy',     name: 'Gold Trophy',       unlockedAtLevel: 10 },
  { id: 'bg_space',       type: 'background', name: 'Space Adventure',   unlockedAtLevel: 3  },
  { id: 'bg_ocean',       type: 'background', name: 'Ocean Depths',      unlockedAtLevel: 7  },
  { id: 'bg_jungle',      type: 'background', name: 'Jungle Explorer',   unlockedAtLevel: 15 },
];

export function createDefaultState(): AppState {
  return {
    settings: DEFAULT_SETTINGS,
    history: {},
    totalXP: 0,
    allowanceBalance: 0,
    lifetimeAllowanceEarned: 0,
    savingsGoals: [],
    achievements: DEFAULT_ACHIEVEMENTS,
    avatarUnlocks: DEFAULT_AVATAR_UNLOCKS,
    currentStreak: 0,
    longestStreak: 0,
    lastUpdatedDate: '',
  };
}

/** Map a YYYY-MM-DD date to its weekday key */
export function weekdayFromDate(date: string): Weekday {
  const [y, m, day] = date.split('-').map(Number);
  const dow = new Date(y, m - 1, day).getDay();
  return WEEKDAYS[dow];
}

/** Helper task rotation — pick task based on date when multiple tasks exist */
export function getTodaysHelperTask(tasks: string[], date: string): string {
  if (tasks.length === 0) return 'Help the Family';
  if (tasks.length === 1) return tasks[0];
  const dateNum = date.replace(/-/g, '');
  const index = parseInt(dateNum.slice(-3), 10) % tasks.length;
  return tasks[index];
}

/**
 * Resolve helper task for a date:
 * 1) per-date override
 * 2) weekday schedule
 * 3) task-list rotation / fallback
 */
export function getHelperTaskForDate(
  tasks: string[],
  date: string,
  dailyOverrides?: Record<string, string>,
  weekdayTasks?: WeekdayHelperTasks,
): string {
  if (dailyOverrides?.[date]?.trim()) return dailyOverrides[date].trim();

  if (weekdayTasks) {
    const weekday = weekdayFromDate(date);
    const scheduled = weekdayTasks[weekday]?.trim();
    if (scheduled) return scheduled;
  }

  return getTodaysHelperTask(tasks, date);
}

/** Ensure weekdayHelperTasks always has all 7 days after loading old saves */
export function normalizeWeekdayHelperTasks(
  partial?: Partial<WeekdayHelperTasks> | null,
  helperTasks?: string[],
): WeekdayHelperTasks {
  if (partial && WEEKDAYS.every(day => partial[day] != null)) {
    return { ...DEFAULT_WEEKDAY_HELPER_TASKS, ...partial };
  }

  // Migrate older saves: fill missing weekdays from the task list
  const fallbackList =
    helperTasks && helperTasks.length > 0
      ? helperTasks
      : Object.values(DEFAULT_WEEKDAY_HELPER_TASKS);

  const seeded = { ...DEFAULT_WEEKDAY_HELPER_TASKS };
  WEEKDAYS.forEach((day, i) => {
    seeded[day] = fallbackList[i % fallbackList.length];
  });

  return { ...seeded, ...(partial ?? {}) };
}
