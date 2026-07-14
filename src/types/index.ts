// ============================================================
// Kids Mission Dashboard — TypeScript Interfaces
// ============================================================

/** Morning routine sub-tasks (Make Bed mission slot) */
export interface MorningRoutineSteps {
  makeBed: boolean;
  getDressed: boolean;
  brushTeeth: boolean;
}

export type MorningRoutineStep = keyof MorningRoutineSteps;

/** One record per calendar day, keyed by "YYYY-MM-DD" */
export interface DayRecord {
  date: string; // "YYYY-MM-DD"
  tasks: {
    makeBed: boolean; // true when all morning routine steps are done
    helpFamily: boolean;
    reading: boolean;
    math: boolean;
  };
  morningRoutine?: MorningRoutineSteps;
  readingMinutes: number;
  mathScore: number; // correct answers (legacy: 0–5, new quizzes: 0–10)
  mathQuestionCount?: number; // 5 for historical quizzes, 10 for new (defaults to 5)
  xpEarned: number;
  allowanceEarned: number;
  completionTimestamps: {
    makeBed?: string;
    helpFamily?: string;
    reading?: string;
    math?: string;
    morningRoutine?: Partial<Record<MorningRoutineStep, string>>;
  };
  mathPerfect?: boolean;
  helperTaskName?: string;
}

/** XP and leveling */
export interface XPState {
  totalXP: number;
  level: number;
  xpForNextLevel: number;
}

/** Allowance tracking */
export interface AllowanceState {
  currentBalance: number;
  lifetimeEarned: number;
  weeklyEarnings: number;
}

/** Savings goal */
export interface SavingsGoal {
  id: string;
  name: string;
  targetCost: number;
  currentProgress: number;
  createdAt: string;
  completedAt?: string;
}

/** Avatar unlock */
export interface AvatarUnlock {
  id: string;
  type: 'hat' | 'trophy' | 'background';
  name: string;
  unlockedAtLevel: number;
  unlockedAt?: string; // ISO timestamp when actually unlocked
}

/** Achievement badge */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO timestamp, undefined = locked
}

/** Math difficulty by school grade */
export type MathDifficulty =
  | 'kindergarten'
  | 'grade1'
  | 'grade2'
  | 'grade3'
  | 'grade4'
  | 'grade5';

/** Dashboard visual theme */
export type ThemeId =
  | 'default'
  | 'unicorn'
  | 'forest'
  | 'ocean'
  | 'dino'
  | 'fairy';

/** Days of the week for helper task schedule */
export type Weekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type WeekdayHelperTasks = Record<Weekday, string>;

/** Night screen dimming mode */
export type NightDimMode = 'off' | 'on' | 'auto';

/** Application settings */
export interface AppSettings {
  childName: string;
  birthday: string; // "YYYY-MM-DD"
  vacationDates: Array<{ label: string; date: string }>;
  allowanceAmount: number; // weekly total
  dailyReadingGoal: number; // minutes
  mathDifficulty: MathDifficulty;
  /** US ZIP code for weather forecast */
  weatherZip: string;
  /** IANA timezone for calendar day / clock (e.g. America/Chicago) */
  timezone: string;
  /** Visual theme id */
  theme: ThemeId;
  /** Night dim: off, always on, or schedule */
  nightDimMode: NightDimMode;
  /** Start of dim window "HH:MM" (24h), used when mode is auto */
  nightDimStart: string;
  /** End of dim window "HH:MM" (24h), used when mode is auto */
  nightDimEnd: string;
  helperTasks: string[];
  /** Helper task assigned to each weekday */
  weekdayHelperTasks: WeekdayHelperTasks;
  /** Optional per-date helper task override, keyed "YYYY-MM-DD" */
  dailyHelperTasks?: Record<string, string>;
  parentPin: string;
  soundEnabled: boolean;
  currentAvatarHat?: string;
  currentAvatarBackground?: string;
}

/** Entire persisted app state */
export interface AppState {
  settings: AppSettings;
  history: Record<string, DayRecord>; // keyed "YYYY-MM-DD"
  totalXP: number;
  allowanceBalance: number;
  lifetimeAllowanceEarned: number;
  savingsGoals: SavingsGoal[];
  achievements: Achievement[];
  avatarUnlocks: AvatarUnlock[];
  currentStreak: number;
  longestStreak: number;
  lastUpdatedDate: string; // "YYYY-MM-DD"
}

/** Math quiz question */
export interface MathQuestion {
  a: number;
  b: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  display: string;
}

/** Active screen enum */
export type Screen = 'home' | 'admin' | 'history' | 'reports' | 'settings' | 'goals' | 'achievements' | 'avatar';

/** Math quiz state */
export interface QuizState {
  questions: MathQuestion[];
  currentIndex: number;
  answers: (number | null)[];
  isComplete: boolean;
  score: number;
}
