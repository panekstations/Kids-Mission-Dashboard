// ============================================================
// Visual themes for the child dashboard
// ============================================================

export type ThemeId =
  | 'default'
  | 'unicorn'
  | 'forest'
  | 'ocean'
  | 'dino'
  | 'fairy';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  /** Full-page background gradient */
  background: string;
  /** Admin / modal background (slightly darker variant) */
  adminBackground: string;
  /** Progress ring + key accent hex */
  accent: string;
  /** Tailwind text class for accent labels (day name, XP, buttons) */
  accentText: string;
  /** Soft accent button classes */
  accentButton: string;
  /** Main heading text on the page background */
  pageTitle: string;
  /** Supporting copy on the page background */
  pageMuted: string;
  /** Mission tile gradients */
  missionMorning: string;
  missionHelp: string;
  missionReading: string;
  missionMath: string;
  /** Inline action button tints on tiles */
  helpButton: string;
  mathButton: string;
  readingBar: string;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  default: {
    id: 'default',
    label: 'Default',
    emoji: '🚀',
    description: 'Deep space navy & purple',
    background: 'linear-gradient(160deg, #0d1b4b 0%, #1a1040 40%, #2d0a5e 100%)',
    adminBackground: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)',
    accent: '#f59e0b',
    accentText: 'text-yellow-400',
    accentButton:
      'bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300',
    pageTitle: 'text-white',
    pageMuted: 'text-white/70',
    missionMorning: 'bg-gradient-to-br from-blue-600 to-blue-800',
    missionHelp: 'bg-gradient-to-br from-orange-600 to-orange-800',
    missionReading: 'bg-gradient-to-br from-purple-600 to-purple-800',
    missionMath: 'bg-gradient-to-br from-rose-600 to-rose-800',
    helpButton: 'bg-orange-400/30 hover:bg-orange-400/40',
    mathButton: 'bg-pink-400/30 hover:bg-pink-400/40',
    readingBar: 'bg-purple-300',
  },
  unicorn: {
    id: 'unicorn',
    label: 'Unicorn',
    emoji: '🦄',
    description: 'Pink, lavender & sky blue sparkles',
    background: 'linear-gradient(160deg, #f9a8d4 0%, #c084fc 45%, #7dd3fc 100%)',
    adminBackground: 'linear-gradient(160deg, #831843 0%, #6b21a8 50%, #1e3a5f 100%)',
    accent: '#f472b6',
    accentText: 'text-fuchsia-900',
    accentButton:
      'bg-fuchsia-600/20 hover:bg-fuchsia-600/30 border border-fuchsia-500/40 text-fuchsia-900',
    pageTitle: 'text-fuchsia-950',
    pageMuted: 'text-fuchsia-900/70',
    missionMorning: 'bg-gradient-to-br from-sky-400 to-sky-600',
    missionHelp: 'bg-gradient-to-br from-fuchsia-400 to-pink-600',
    missionReading: 'bg-gradient-to-br from-violet-400 to-purple-600',
    missionMath: 'bg-gradient-to-br from-rose-400 to-rose-600',
    helpButton: 'bg-white/25 hover:bg-white/35',
    mathButton: 'bg-white/25 hover:bg-white/35',
    readingBar: 'bg-fuchsia-100',
  },
  forest: {
    id: 'forest',
    label: 'Forest Adventure',
    emoji: '🌲',
    description: 'Sage, cream & sunflower gold',
    background: 'linear-gradient(160deg, #365314 0%, #3f6212 35%, #854d0e 100%)',
    adminBackground: 'linear-gradient(160deg, #1a2e05 0%, #365314 60%, #713f12 100%)',
    accent: '#facc15',
    accentText: 'text-yellow-300',
    accentButton:
      'bg-yellow-400/25 hover:bg-yellow-400/35 border border-yellow-300/50 text-yellow-100',
    pageTitle: 'text-white',
    pageMuted: 'text-white/70',
    missionMorning: 'bg-gradient-to-br from-lime-600 to-green-800',
    missionHelp: 'bg-gradient-to-br from-amber-500 to-orange-700',
    missionReading: 'bg-gradient-to-br from-emerald-600 to-teal-800',
    missionMath: 'bg-gradient-to-br from-yellow-600 to-amber-800',
    helpButton: 'bg-amber-300/30 hover:bg-amber-300/40',
    mathButton: 'bg-yellow-300/30 hover:bg-yellow-300/40',
    readingBar: 'bg-lime-200',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean Explorer',
    emoji: '🌊',
    description: 'Teal depths & coral accents',
    background: 'linear-gradient(160deg, #083344 0%, #0e7490 40%, #155e75 70%, #9a3412 100%)',
    adminBackground: 'linear-gradient(160deg, #042f2e 0%, #0e7490 60%, #7c2d12 100%)',
    accent: '#fb7185',
    accentText: 'text-rose-300',
    accentButton:
      'bg-rose-400/25 hover:bg-rose-400/35 border border-rose-300/50 text-rose-100',
    pageTitle: 'text-white',
    pageMuted: 'text-white/70',
    missionMorning: 'bg-gradient-to-br from-cyan-500 to-teal-700',
    missionHelp: 'bg-gradient-to-br from-orange-400 to-rose-600',
    missionReading: 'bg-gradient-to-br from-sky-500 to-blue-700',
    missionMath: 'bg-gradient-to-br from-teal-400 to-cyan-700',
    helpButton: 'bg-rose-300/30 hover:bg-rose-300/40',
    mathButton: 'bg-cyan-300/30 hover:bg-cyan-300/40',
    readingBar: 'bg-sky-200',
  },
  dino: {
    id: 'dino',
    label: 'Dino Dig',
    emoji: '🦕',
    description: 'Clay, olive & amber fossils',
    background: 'linear-gradient(160deg, #44403c 0%, #57534e 30%, #78716c 55%, #a16207 100%)',
    adminBackground: 'linear-gradient(160deg, #292524 0%, #44403c 50%, #713f12 100%)',
    accent: '#84cc16',
    accentText: 'text-lime-300',
    accentButton:
      'bg-lime-400/25 hover:bg-lime-400/35 border border-lime-300/50 text-lime-100',
    pageTitle: 'text-white',
    pageMuted: 'text-white/70',
    missionMorning: 'bg-gradient-to-br from-stone-500 to-stone-700',
    missionHelp: 'bg-gradient-to-br from-lime-600 to-green-800',
    missionReading: 'bg-gradient-to-br from-amber-600 to-yellow-800',
    missionMath: 'bg-gradient-to-br from-orange-600 to-red-800',
    helpButton: 'bg-lime-400/30 hover:bg-lime-400/40',
    mathButton: 'bg-orange-400/30 hover:bg-orange-400/40',
    readingBar: 'bg-amber-200',
  },
  fairy: {
    id: 'fairy',
    label: 'Fairy Garden',
    emoji: '🧚',
    description: 'Mint, blush pink & lilac petals',
    background: 'linear-gradient(160deg, #bbf7d0 0%, #fbcfe8 40%, #e9d5ff 100%)',
    adminBackground: 'linear-gradient(160deg, #166534 0%, #9d174d 45%, #6b21a8 100%)',
    accent: '#e879f9',
    accentText: 'text-fuchsia-700',
    accentButton:
      'bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-400/40 text-fuchsia-800',
    pageTitle: 'text-fuchsia-950',
    pageMuted: 'text-fuchsia-900/70',
    missionMorning: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    missionHelp: 'bg-gradient-to-br from-pink-400 to-rose-500',
    missionReading: 'bg-gradient-to-br from-violet-400 to-purple-500',
    missionMath: 'bg-gradient-to-br from-fuchsia-400 to-pink-500',
    helpButton: 'bg-white/30 hover:bg-white/40',
    mathButton: 'bg-white/30 hover:bg-white/40',
    readingBar: 'bg-violet-100',
  },
};

export const THEME_OPTIONS = Object.values(THEMES);

export function getTheme(id?: string | null): ThemeDefinition {
  if (id && id in THEMES) return THEMES[id as ThemeId];
  return THEMES.default;
}

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}
