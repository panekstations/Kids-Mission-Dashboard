// ============================================================
// SettingsScreen — parent configuration panel
// ============================================================

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import type { AppSettings, MathDifficulty, NightDimMode, ThemeId, Weekday } from '../types';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  TIMEZONE_OPTIONS,
  normalizeWeekdayHelperTasks,
} from '../data/defaults';
import { THEME_OPTIONS } from '../data/themes';
import { DEFAULT_TIMEZONE } from '../utils/storage';

const MATH_LEVELS: Array<{ value: MathDifficulty; label: string }> = [
  { value: 'kindergarten', label: 'Kindergarten (add within 10)' },
  { value: 'grade1', label: '1st Grade (add/subtract within 20)' },
  { value: 'grade2', label: '2nd Grade (larger numbers + times tables)' },
  { value: 'grade3', label: '3rd Grade (× / ÷ facts + bigger add/subtract)' },
  { value: 'grade4', label: '4th Grade (harder × / ÷ and 3-digit numbers)' },
  { value: 'grade5', label: '5th Grade (multi-digit × / ÷ and large numbers)' },
];

const NIGHT_DIM_MODES: Array<{ value: NightDimMode; label: string }> = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
  { value: 'auto', label: 'Auto' },
];

export function SettingsScreen() {
  const { state, updateSettings } = useApp();
  const [s, setS] = useState<AppSettings>({
    ...state.settings,
    weekdayHelperTasks: normalizeWeekdayHelperTasks(state.settings.weekdayHelperTasks),
    weatherZip: state.settings.weatherZip || '60622',
    timezone: state.settings.timezone || DEFAULT_TIMEZONE,
    theme: state.settings.theme || 'default',
    nightDimMode: state.settings.nightDimMode || 'auto',
    nightDimStart: state.settings.nightDimStart || '21:00',
    nightDimEnd: state.settings.nightDimEnd || '06:00',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const zip = s.weatherZip.replace(/\D/g, '').slice(0, 5);
    updateSettings({
      ...s,
      weatherZip: zip.length === 5 ? zip : s.weatherZip.trim() || '60622',
      timezone: s.timezone || DEFAULT_TIMEZONE,
      theme: s.theme || 'default',
      nightDimMode: s.nightDimMode || 'auto',
      nightDimStart: s.nightDimStart || '21:00',
      nightDimEnd: s.nightDimEnd || '06:00',
      weekdayHelperTasks: normalizeWeekdayHelperTasks(s.weekdayHelperTasks, s.helperTasks),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setWeekdayTask = (day: Weekday, task: string) => {
    setS(prev => ({
      ...prev,
      weekdayHelperTasks: { ...prev.weekdayHelperTasks, [day]: task },
    }));
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
        ⚙️ Settings
      </h2>

      <div className="space-y-4">

        {/* Basic info */}
        <Section title="👤 Child Info">
          <Field label="Child's Name">
            <input value={s.childName} onChange={e => setS(p => ({ ...p, childName: e.target.value }))}
                   className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20" />
          </Field>
          <Field label="Birthday">
            <input type="date" value={s.birthday} onChange={e => setS(p => ({ ...p, birthday: e.target.value }))}
                   className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20" />
          </Field>
        </Section>

        {/* Theme */}
        <Section title="🎨 Theme">
          <p className="text-white/40 text-xs">
            Choose how the dashboard looks. Changes apply after you save.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEME_OPTIONS.map(theme => {
              const selected = (s.theme || 'default') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setS(p => ({ ...p, theme: theme.id as ThemeId }))}
                  className={`
                    text-left rounded-xl p-3 border transition-all active:scale-[0.98]
                    ${selected
                      ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/40'
                      : 'border-white/15 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div
                    className="h-10 rounded-lg mb-2 border border-white/10"
                    style={{ background: theme.background }}
                  />
                  <div className="text-white font-bold text-sm">
                    {theme.emoji} {theme.label}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{theme.description}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Weather & timezone */}
        <Section title="🌤️ Location & Time">
          <Field label="ZIP Code">
            <input
              value={s.weatherZip}
              onChange={e => setS(p => ({ ...p, weatherZip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
              inputMode="numeric"
              maxLength={5}
              placeholder="60622"
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 tracking-widest"
            />
            <p className="text-white/40 text-xs mt-1">
              US ZIP code used for the 5-day forecast on the home screen.
            </p>
          </Field>
          <Field label="Timezone">
            <select
              value={s.timezone || DEFAULT_TIMEZONE}
              onChange={e => setS(p => ({ ...p, timezone: e.target.value }))}
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20"
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz.value} value={tz.value} className="bg-slate-800">
                  {tz.label}
                </option>
              ))}
              {s.timezone && !TIMEZONE_OPTIONS.some(tz => tz.value === s.timezone) && (
                <option value={s.timezone} className="bg-slate-800">
                  {s.timezone}
                </option>
              )}
            </select>
            <p className="text-white/40 text-xs mt-1">
              Controls the clock, calendar day, midnight reset, and night dim schedule.
            </p>
          </Field>
        </Section>

        {/* Night dim */}
        <Section title="🌙 Night Dim">
          <p className="text-white/40 text-xs">
            Softens the home screen brightness for bedtime. Admin stays full brightness.
          </p>
          <Field label="Mode">
            <div className="flex gap-2">
              {NIGHT_DIM_MODES.map(mode => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setS(p => ({ ...p, nightDimMode: mode.value }))}
                  className={`
                    flex-1 py-2 rounded-xl text-sm font-bold transition-all active:scale-95
                    ${(s.nightDimMode || 'auto') === mode.value
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }
                  `}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-1">
              Off = never · On = always dim · Auto = between the times below
            </p>
          </Field>
          {(s.nightDimMode || 'auto') === 'auto' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dim from">
                <input
                  type="time"
                  value={s.nightDimStart || '21:00'}
                  onChange={e => setS(p => ({ ...p, nightDimStart: e.target.value || '21:00' }))}
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20"
                />
              </Field>
              <Field label="Dim until">
                <input
                  type="time"
                  value={s.nightDimEnd || '06:00'}
                  onChange={e => setS(p => ({ ...p, nightDimEnd: e.target.value || '06:00' }))}
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20"
                />
              </Field>
            </div>
          )}
          {(s.nightDimMode || 'auto') === 'auto' && (
            <p className="text-white/40 text-xs">
              Uses your selected timezone. Overnight ranges (e.g. 9:00 PM → 6:00 AM) are supported.
            </p>
          )}
        </Section>

        {/* Missions */}
        <Section title="📋 Mission Settings">
          <Field label="Weekly Allowance ($)">
            <input type="number" step="0.25" value={s.allowanceAmount}
                   onChange={e => setS(p => ({ ...p, allowanceAmount: parseFloat(e.target.value) || 5 }))}
                   className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20" />
          </Field>
          <Field label="Daily Reading Goal (minutes)">
            <input type="number" value={s.dailyReadingGoal}
                   onChange={e => setS(p => ({ ...p, dailyReadingGoal: parseInt(e.target.value) || 20 }))}
                   className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20" />
          </Field>
          <Field label="Math Level">
            <select value={s.mathDifficulty}
                    onChange={e => setS(p => ({ ...p, mathDifficulty: e.target.value as MathDifficulty }))}
                    className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20">
              {MATH_LEVELS.map(level => (
                <option key={level.value} value={level.value} className="bg-slate-800">
                  {level.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        {/* Helper tasks by weekday */}
        <Section title="🤝 Help the Family — Weekly Schedule">
          <p className="text-white/40 text-xs">
            Set the helper task for each day of the week. Today&apos;s mission uses today&apos;s weekday.
          </p>
          {WEEKDAYS.map(day => (
            <Field key={day} label={WEEKDAY_LABELS[day]}>
              <input
                value={s.weekdayHelperTasks[day]}
                onChange={e => setWeekdayTask(day, e.target.value)}
                placeholder="e.g. Set the Table"
                className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 text-sm placeholder:text-white/30"
              />
            </Field>
          ))}
        </Section>

        {/* Security */}
        <Section title="🔒 Security">
          <Field label="Parent PIN (4 digits)">
            <input type="password" maxLength={4} value={s.parentPin}
                   onChange={e => setS(p => ({ ...p, parentPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                   className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 tracking-widest text-2xl" />
          </Field>
        </Section>

        {/* Sound */}
        <Section title="🔊 Audio">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setS(p => ({ ...p, soundEnabled: !p.soundEnabled }))}
              className={`w-12 h-6 rounded-full transition-colors ${s.soundEnabled ? 'bg-green-400' : 'bg-white/20'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${s.soundEnabled ? 'translate-x-6' : ''}`} />
            </div>
            <span className="text-white">Sound Effects</span>
          </label>
        </Section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`w-full py-4 font-black text-xl rounded-2xl transition-all active:scale-95
            ${saved ? 'bg-green-400 text-white' : 'bg-yellow-400 text-gray-900'}`}
          style={{ fontFamily: 'Fredoka One, cursive' }}
        >
          {saved ? '✓ SAVED!' : 'SAVE SETTINGS'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-white font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-white/60 text-xs font-bold uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
