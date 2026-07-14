// ============================================================
// ReportsScreen — statistics and simple charts
// ============================================================

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { lastNDays, getDayStatus, getMathQuestionCount } from '../utils/storage';

type Period = '7' | '30' | 'all';

export function ReportsScreen() {
  const { state, today } = useApp();
  const [period, setPeriod] = useState<Period>('7');

  const getDates = () => {
    if (period === '7') return lastNDays(7, today);
    if (period === '30') return lastNDays(30, today);
    return Object.keys(state.history).sort();
  };

  const dates = getDates();
  const records = dates.map(d => state.history[d]).filter(Boolean);

  // Calculate metrics
  const bedsMade = records.filter(r => r.tasks.makeBed).length; // morning routine complete
  const helperDone = records.filter(r => r.tasks.helpFamily).length;
  const totalReadingMins = records.reduce((sum, r) => sum + r.readingMinutes, 0);
  const mathDone = records.filter(r => r.tasks.math).length;
  const mathTotal = records.filter(r => r.tasks.math);
  const mathAccuracy = mathTotal.length
    ? Math.round(
        (mathTotal.reduce((s, r) => s + r.mathScore, 0) /
          mathTotal.reduce((s, r) => s + getMathQuestionCount(r), 0)) * 100
      )
    : 0;
  const allowanceEarned = records.reduce((sum, r) => sum + r.allowanceEarned, 0);
  const xpEarned = records.reduce((sum, r) => sum + r.xpEarned, 0);
  const completeDays = records.filter(r => getDayStatus(r) === 'complete' || getDayStatus(r) === 'perfect').length;
  const completionPct = dates.filter(d => d <= today).length
    ? Math.round((completeDays / dates.filter(d => d <= today).length) * 100)
    : 0;

  const stats = [
    { label: 'Morning Routines', value: bedsMade, icon: '🌅' },
    { label: 'Helper Tasks', value: helperDone, icon: '🤝' },
    { label: 'Reading Minutes', value: totalReadingMins, icon: '📚' },
    { label: 'Math Quizzes', value: mathDone, icon: '🧮' },
    { label: 'Math Accuracy', value: `${mathAccuracy}%`, icon: '✅' },
    { label: 'Allowance Earned', value: `$${allowanceEarned.toFixed(2)}`, icon: '💰' },
    { label: 'Completion Rate', value: `${completionPct}%`, icon: '🎯' },
    { label: 'XP Earned', value: xpEarned, icon: '⭐' },
    { label: 'Current Streak', value: `${state.currentStreak} days`, icon: '🔥' },
    { label: 'Longest Streak', value: `${state.longestStreak} days`, icon: '🏆' },
  ];

  // Simple bar chart for last 7 days reading
  const last7 = lastNDays(7, today);
  const maxReading = Math.max(...last7.map(d => state.history[d]?.readingMinutes ?? 0), 1);

  return (
    <div className="p-4 pb-8">
      <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
        📊 Reports
      </h2>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {([['7', 'Last 7 Days'], ['30', 'Last 30 Days'], ['all', 'All Time']] as [Period, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              period === val ? 'bg-yellow-400 text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-white font-black text-xl">{s.value}</div>
            <div className="text-white/60 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reading chart */}
      <div className="bg-white/10 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3">📚 Reading Minutes — Last 7 Days</h3>
        <div className="flex items-end gap-2 h-20">
          {last7.map(d => {
            const mins = state.history[d]?.readingMinutes ?? 0;
            const pct = (mins / maxReading) * 100;
            const dayName = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-purple-400 rounded-t-lg transition-all"
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <div className="text-white/50 text-xs">{dayName}</div>
                <div className="text-white/70 text-xs">{mins}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion chart */}
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">🎯 Daily Completion — Last 7 Days</h3>
        <div className="flex gap-2">
          {last7.map(d => {
            const record = state.history[d];
            const completed = record
              ? [record.tasks.makeBed, record.tasks.helpFamily, record.tasks.reading, record.tasks.math].filter(Boolean).length
              : 0;
            const status = getDayStatus(record);
            const dayName = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            let bg = 'bg-white/10';
            if (status === 'perfect') bg = 'bg-yellow-500';
            else if (status === 'complete') bg = 'bg-green-500';
            else if (status === 'partial') bg = 'bg-yellow-600';
            else if (status === 'missed' && d < today) bg = 'bg-red-500/60';

            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-12 ${bg} rounded-lg flex items-center justify-center text-white font-black`}>
                  {completed}/4
                </div>
                <div className="text-white/50 text-xs">{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
