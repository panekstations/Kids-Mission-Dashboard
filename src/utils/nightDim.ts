// ============================================================
// Night dim helpers
// ============================================================

import type { NightDimMode } from '../types';

/** Parse "HH:MM" or "HH:MM:SS" to minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h = '0', m = '0'] = time.split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
}

/** Current minutes since midnight in an IANA timezone */
export function minutesNowInTimezone(timeZone: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

/**
 * Whether a clock time falls inside [start, end).
 * Supports overnight windows (e.g. 21:00 → 06:00).
 */
export function isWithinTimeWindow(
  nowMinutes: number,
  start: string,
  end: string,
): boolean {
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);
  if (startM === endM) return true; // full day
  if (startM < endM) {
    return nowMinutes >= startM && nowMinutes < endM;
  }
  // Overnight: e.g. 21:00–06:00
  return nowMinutes >= startM || nowMinutes < endM;
}

export function shouldNightDim(options: {
  mode: NightDimMode;
  start: string;
  end: string;
  timeZone: string;
  now?: Date;
}): boolean {
  const { mode, start, end, timeZone, now = new Date() } = options;
  if (mode === 'off') return false;
  if (mode === 'on') return true;
  return isWithinTimeWindow(minutesNowInTimezone(timeZone, now), start, end);
}
