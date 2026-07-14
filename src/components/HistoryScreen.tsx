// ============================================================
// HistoryScreen — monthly calendar with day detail + edit modal
// ============================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { getDayStatus, datesInMonth, parseDate, getMathQuestionCount, MATH_QUIZ_QUESTION_COUNT, getMorningRoutine, MORNING_ROUTINE_STEPS } from '../utils/storage';
import type { DayRecord, MorningRoutineSteps } from '../types';
import { ChevronLeft, ChevronRight, X, Pencil, Save } from 'lucide-react';

export function HistoryScreen() {
  const { state, today } = useApp();
  const [viewDate, setViewDate] = useState(() => parseDate(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;
  const dates = datesInMonth(year, month);
  const firstDay = parseDate(dates[0]).getDay(); // 0=Sun

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };
  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 pb-8">
      <h2 className="text-white font-black text-2xl mb-1" style={{ fontFamily: 'Fredoka One, cursive' }}>
        📅 History
      </h2>
      <p className="text-white/50 text-sm mb-4">Tap a day to view or edit missions</p>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-white font-bold">{monthName}</div>
        <button onClick={nextMonth} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-white/40 text-xs font-bold py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}

        {dates.map(date => {
          const record = state.history[date];
          const status = getDayStatus(record);
          const isToday = date === today;
          const isFuture = date > today;

          let bg = 'bg-white/5';
          let emoji = '';
          if (!isFuture) {
            if (status === 'perfect') { bg = 'bg-yellow-500'; emoji = '⭐'; }
            else if (status === 'complete') { bg = 'bg-green-500'; emoji = '✓'; }
            else if (status === 'partial') { bg = 'bg-yellow-600/70'; emoji = '~'; }
            else if (status === 'missed') { bg = 'bg-red-500/40'; emoji = '✗'; }
          }

          const day = parseInt(date.split('-')[2], 10);

          return (
            <button
              key={date}
              onClick={() => !isFuture && setSelectedDate(date)}
              className={`
                h-10 rounded-lg flex flex-col items-center justify-center
                ${bg} ${isToday ? 'ring-2 ring-white' : ''}
                ${!isFuture ? 'hover:opacity-80 active:scale-95' : 'opacity-30 cursor-not-allowed'}
                transition-all text-white
              `}
            >
              <div className="text-xs font-bold">{day}</div>
              {emoji && <div className="text-xs">{emoji}</div>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-white/60 flex-wrap">
        <span>⭐ Perfect</span>
        <span className="text-green-400">✓ Complete</span>
        <span className="text-yellow-400">~ Partial</span>
        <span className="text-red-400">✗ Missed</span>
      </div>

      {/* Day detail / edit modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          record={state.history[selectedDate]}
          readingGoal={state.settings.dailyReadingGoal}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

function DayDetailModal({ date, record, readingGoal, onClose }: {
  date: string;
  record?: DayRecord;
  readingGoal: number;
  onClose: () => void;
}) {
  const { updateDayRecord, state } = useApp();
  const [editing, setEditing] = useState(!record);
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineSteps>(() =>
    record ? getMorningRoutine(record) : { makeBed: false, getDressed: false, brushTeeth: false }
  );
  const [helpFamily, setHelpFamily] = useState(record?.tasks.helpFamily ?? false);
  const [reading, setReading] = useState(record?.tasks.reading ?? false);
  const [math, setMath] = useState(record?.tasks.math ?? false);
  const [readingMinutes, setReadingMinutes] = useState(record?.readingMinutes ?? 0);
  const [mathScore, setMathScore] = useState(record?.mathScore ?? 0);

  useEffect(() => {
    setMorningRoutine(record ? getMorningRoutine(record) : { makeBed: false, getDressed: false, brushTeeth: false });
    setHelpFamily(record?.tasks.helpFamily ?? false);
    setReading(record?.tasks.reading ?? false);
    setMath(record?.tasks.math ?? false);
    setReadingMinutes(record?.readingMinutes ?? 0);
    setMathScore(record?.mathScore ?? 0);
    setEditing(!record);
  }, [date, record]);

  const questionCount = record ? getMathQuestionCount(record) : MATH_QUIZ_QUESTION_COUNT;
  const displayDate = parseDate(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleSave = () => {
    updateDayRecord(date, {
      morningRoutine,
      tasks: { helpFamily, reading, math },
      readingMinutes,
      mathScore,
    });
    setEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-sm w-full border border-white/20 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-black text-lg">{displayDate}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Mark what {state.settings.childName} completed on this day:</p>

            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <div className="text-white/70 text-xs font-bold mb-1">🌅 Morning Routine</div>
              {MORNING_ROUTINE_STEPS.map(step => (
                <EditToggle
                  key={step.key}
                  label={step.label}
                  checked={morningRoutine[step.key]}
                  onChange={checked => setMorningRoutine(prev => ({ ...prev, [step.key]: checked }))}
                />
              ))}
            </div>
            <EditToggle label="🤝 Help Family" checked={helpFamily} onChange={setHelpFamily} />

            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <EditToggle label="📚 Reading done" checked={reading} onChange={setReading} />
              <label className="block text-white/70 text-xs">Reading minutes</label>
              <input
                type="number"
                min={0}
                max={300}
                value={readingMinutes}
                onChange={e => {
                  const mins = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setReadingMinutes(mins);
                  if (mins >= readingGoal) setReading(true);
                }}
                className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
              />
              <div className="text-white/40 text-xs">Goal: {readingGoal} min</div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <EditToggle label="🧮 Math quiz done" checked={math} onChange={setMath} />
              <label className="block text-white/70 text-xs">Math score (0–{questionCount})</label>
              <select
                value={mathScore}
                onChange={e => {
                  const score = parseInt(e.target.value, 10);
                  setMathScore(score);
                  if (score > 0) setMath(true);
                }}
                className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
              >
                {Array.from({ length: questionCount + 1 }, (_, n) => (
                  <option key={n} value={n} className="bg-slate-800">{n}/{questionCount}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-400 text-gray-900 font-black rounded-2xl active:scale-95 transition-transform"
            >
              <Save className="w-4 h-4" />
              Save Day
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {!record ? (
              <div className="text-white/50 text-center py-4">No data for this day</div>
            ) : (
              <>
                <DetailRow icon="🌅" label="Morning Routine" done={record.tasks.makeBed}
                           sub={MORNING_ROUTINE_STEPS.map(s =>
                             `${s.label}: ${getMorningRoutine(record)[s.key] ? '✓' : '✗'}`
                           ).join(' · ')} />
                <DetailRow icon="🤝" label="Help Family" done={record.tasks.helpFamily} ts={record.completionTimestamps.helpFamily}
                           sub={record.helperTaskName} />
                <DetailRow icon="📚" label="Reading" done={record.tasks.reading} ts={record.completionTimestamps.reading}
                           sub={`${record.readingMinutes} minutes`} />
                <DetailRow icon="🧮" label="Math Quiz" done={record.tasks.math} ts={record.completionTimestamps.math}
                           sub={record.tasks.math ? `Score: ${record.mathScore}/${getMathQuestionCount(record)}${record.mathPerfect ? ' ⭐ Perfect!' : ''}` : undefined} />

                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <div className="text-yellow-300">⭐ {record.xpEarned} XP</div>
                  <div className="text-green-400">💰 ${record.allowanceEarned.toFixed(2)}</div>
                </div>
              </>
            )}

            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl active:scale-95 transition-all"
            >
              <Pencil className="w-4 h-4" />
              {record ? 'Edit This Day' : 'Add Missions'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EditToggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between bg-white/5 rounded-xl p-3 cursor-pointer">
      <span className="text-white font-bold text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-yellow-400"
      />
    </label>
  );
}

function DetailRow({ icon, label, done, ts, sub }: {
  icon: string; label: string; done: boolean; ts?: string; sub?: string;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${done ? 'bg-green-500/20' : 'bg-white/5'}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-white font-bold text-sm">{label}</span>
          <span className={done ? 'text-green-400' : 'text-red-400'}>{done ? '✓' : '✗'}</span>
        </div>
        {sub && <div className="text-white/60 text-xs mt-0.5">{sub}</div>}
        {ts && <div className="text-white/40 text-xs">{new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
      </div>
    </div>
  );
}
