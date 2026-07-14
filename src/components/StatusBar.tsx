// ============================================================
// StatusBar — bottom bar with XP, level, allowance
// ============================================================

import React from 'react';
import { useApp, useXP } from '../hooks/useApp';
import { getDayStatus, lastNDays } from '../utils/storage';
import { getTheme } from '../data/themes';

export function StatusBar() {
  const { state } = useApp();
  const { totalXP, level, xpInLevel } = useXP();
  const xpPercent = xpInLevel; // already 0-99
  const theme = getTheme(state.settings.theme);

  return (
    <div className="flex items-center gap-5 px-4 py-3 bg-black/40 backdrop-blur border-t border-white/10">
      {/* XP & Level */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-2xl flex-shrink-0">⭐</div>
        <div className="flex-shrink-0">
          <div className="text-white/75 text-sm font-bold">LEVEL {level}</div>
          <div className="text-white font-black text-lg leading-tight">{totalXP} XP</div>
        </div>
        {/* XP bar */}
        <div className="flex-1 min-w-0 max-w-[140px]">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%`, backgroundColor: theme.accent }}
            />
          </div>
          <div className="text-white/60 text-sm font-semibold mt-1">{100 - xpPercent} to next level</div>
        </div>
      </div>

      {/* Allowance */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-green-400 text-2xl">💰</div>
        <div>
          <div className="text-white/75 text-sm font-bold">BALANCE</div>
          <div className="text-green-400 font-black text-lg leading-tight">${state.allowanceBalance.toFixed(2)}</div>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-orange-400 text-2xl">🔥</div>
        <div>
          <div className="text-white/75 text-sm font-bold">STREAK</div>
          <div className="text-orange-400 font-black text-lg leading-tight">{state.currentStreak} days</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SevenDayStrip — last 7 days completion display
// ============================================================

export function SevenDayStrip() {
  const { state, today } = useApp();
  const theme = getTheme(state.settings.theme);
  const days = lastNDays(7, today);
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="flex gap-2 px-4 py-2 justify-center">
      {days.map(date => {
        const d = new Date(date + 'T12:00:00');
        const name = dayNames[d.getDay()];
        const record = state.history[date];
        const status = getDayStatus(record);
        const isToday = date === today;

        let bg = 'bg-white/10';
        let emoji = '';
        if (status === 'perfect') { bg = 'bg-yellow-500'; emoji = '⭐'; }
        else if (status === 'complete') { bg = 'bg-green-500'; emoji = '✓'; }
        else if (status === 'partial') { bg = 'bg-yellow-600'; emoji = '~'; }
        else if (status === 'missed' && date < today) { bg = 'bg-red-500/60'; emoji = '✗'; }

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div
              className={`
                w-9 h-9 rounded-full ${bg} flex items-center justify-center
                text-white text-sm font-bold
                ${isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}
              `}
            >
              {emoji}
            </div>
            <div className={`text-xs font-bold ${isToday ? theme.pageTitle : theme.pageMuted}`}>
              {isToday ? 'TODAY' : name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
