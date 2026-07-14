// ============================================================
// GoalsScreen — savings goals management
// ============================================================

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export function GoalsScreen() {
  const { state, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, adjustAllowance } = useApp();
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const target = parseFloat(newTarget);
    if (!newName.trim() || isNaN(target) || target <= 0) return;
    addSavingsGoal(newName.trim(), target);
    setNewName('');
    setNewTarget('');
  };

  const handleTransfer = (goalId: string) => {
    const amount = parseFloat(transferAmount[goalId] ?? '0');
    if (isNaN(amount) || amount <= 0 || amount > state.allowanceBalance) return;
    updateSavingsGoal(goalId, (state.savingsGoals.find(g => g.id === goalId)?.currentProgress ?? 0) + amount);
    adjustAllowance(-amount);
    setTransferAmount(prev => ({ ...prev, [goalId]: '' }));
  };

  return (
    <div className="p-4 pb-8">
      <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
        🎯 Savings Goals
      </h2>

      <div className="bg-white/10 rounded-2xl p-4 mb-4 text-center">
        <div className="text-green-400 font-black text-3xl">${state.allowanceBalance.toFixed(2)}</div>
        <div className="text-white/60 text-sm">Available Balance</div>
        <div className="text-white/40 text-xs mt-1">Lifetime Earned: ${state.lifetimeAllowanceEarned.toFixed(2)}</div>
      </div>

      {/* Allowance manual controls */}
      <div className="bg-white/10 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3">💳 Allowance Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={() => adjustAllowance(0.71)}
            className="flex-1 py-2 bg-green-500/30 text-green-400 font-bold rounded-xl text-sm hover:bg-green-500/50"
          >
            + Add $0.71
          </button>
          <button
            onClick={() => adjustAllowance(5)}
            className="flex-1 py-2 bg-green-500/30 text-green-400 font-bold rounded-xl text-sm hover:bg-green-500/50"
          >
            + Add $5.00
          </button>
          <button
            onClick={() => {
              const amt = parseFloat(prompt('Amount to deduct:') ?? '0');
              if (!isNaN(amt) && amt > 0) adjustAllowance(-amt);
            }}
            className="flex-1 py-2 bg-red-500/30 text-red-400 font-bold rounded-xl text-sm hover:bg-red-500/50"
          >
            − Deduct
          </button>
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-3 mb-4">
        {state.savingsGoals.length === 0 && (
          <div className="text-center text-white/40 py-8">No goals yet — add one below!</div>
        )}
        {state.savingsGoals.map(goal => {
          const pct = Math.min((goal.currentProgress / goal.targetCost) * 100, 100);
          const remaining = Math.max(goal.targetCost - goal.currentProgress, 0);
          return (
            <div key={goal.id} className="bg-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white font-black">{goal.name}</div>
                  <div className="text-white/60 text-sm">
                    ${goal.currentProgress.toFixed(2)} / ${goal.targetCost.toFixed(2)}
                  </div>
                </div>
                <button onClick={() => deleteSavingsGoal(goal.id)} className="text-red-400/60 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60 mb-3">
                <span>{Math.round(pct)}% complete</span>
                <span>${remaining.toFixed(2)} remaining</span>
              </div>
              {pct < 100 && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount..."
                    value={transferAmount[goal.id] ?? ''}
                    onChange={e => setTransferAmount(p => ({ ...p, [goal.id]: e.target.value }))}
                    className="flex-1 bg-white/10 text-white rounded-xl px-3 py-2 text-sm border border-white/20"
                  />
                  <button
                    onClick={() => handleTransfer(goal.id)}
                    className="px-3 py-2 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm"
                  >
                    Move $
                  </button>
                </div>
              )}
              {pct >= 100 && (
                <div className="text-center text-yellow-400 font-bold">🎉 GOAL REACHED!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add goal form */}
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">✨ New Goal</h3>
        <div className="space-y-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Goal name (e.g. LEGO Set)"
            className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 placeholder:text-white/30"
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              placeholder="Target amount ($)"
              className="flex-1 bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 placeholder:text-white/30"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-yellow-400 text-gray-900 font-black rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AchievementsScreen
// ============================================================

export function AchievementsScreen({ title = '🏅 Achievements' }: { title?: string }) {
  const { state } = useApp();
  const unlocked = state.achievements.filter(a => a.unlockedAt);
  const locked = state.achievements.filter(a => !a.unlockedAt);

  return (
    <div className="p-4 pb-8">
      <h2 className="text-white font-black text-2xl mb-2" style={{ fontFamily: 'Fredoka One, cursive' }}>
        {title}
      </h2>
      <div className="text-white/50 text-sm mb-4">{unlocked.length} / {state.achievements.length} unlocked</div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {unlocked.map(a => (
          <div key={a.id} className="bg-yellow-500/20 border border-yellow-500/40 rounded-2xl p-4 text-center">
            <div className="text-4xl mb-2">{a.icon}</div>
            <div className="text-yellow-300 font-black text-sm">{a.name}</div>
            <div className="text-white/60 text-xs mt-1">{a.description}</div>
            <div className="text-yellow-400/60 text-xs mt-1">
              {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : ''}
            </div>
          </div>
        ))}
      </div>

      {locked.length > 0 && (
        <>
          <div className="text-white/40 text-sm font-bold mb-3 uppercase tracking-wide">Locked</div>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(a => (
              <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center opacity-50">
                <div className="text-4xl mb-2 grayscale">🔒</div>
                <div className="text-white/60 font-black text-sm">{a.name}</div>
                <div className="text-white/40 text-xs mt-1">{a.description}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// AvatarScreen
// ============================================================

export function AvatarScreen() {
  const { state } = useApp();
  const { avatarUnlocks } = state;
  const level = Math.floor(state.totalXP / 100) + 1;

  const hats = avatarUnlocks.filter(a => a.type === 'hat');
  const trophies = avatarUnlocks.filter(a => a.type === 'trophy');
  const bgs = avatarUnlocks.filter(a => a.type === 'background');

  const hatEmojis: Record<string, string> = {
    hat_star: '⭐', hat_wizard: '🧙', hat_crown: '👑', hat_superhero: '🦸',
  };
  const trophyEmojis: Record<string, string> = {
    trophy_bronze: '🥉', trophy_silver: '🥈', trophy_gold: '🥇',
  };
  const bgEmojis: Record<string, string> = {
    bg_space: '🚀', bg_ocean: '🌊', bg_jungle: '🌿',
  };

  return (
    <div className="p-4 pb-8">
      <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
        🎭 My Avatar
      </h2>

      {/* Avatar display */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-8 text-center mb-6 border border-purple-500/30">
        <div className="text-8xl mb-2">🧒</div>
        <div className="text-yellow-400 font-black text-xl">Level {level}</div>
        <div className="text-white/60 text-sm">{state.totalXP} XP</div>
      </div>

      {/* Unlocks by category */}
      {[
        { title: '🎩 Hats', items: hats, emojis: hatEmojis },
        { title: '🏆 Trophies', items: trophies, emojis: trophyEmojis },
        { title: '🖼️ Backgrounds', items: bgs, emojis: bgEmojis },
      ].map(cat => (
        <div key={cat.title} className="mb-4">
          <h3 className="text-white font-bold mb-2">{cat.title}</h3>
          <div className="grid grid-cols-4 gap-2">
            {cat.items.map(item => {
              const unlocked = !!item.unlockedAt;
              return (
                <div
                  key={item.id}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center
                    ${unlocked ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10 opacity-40'}`}
                >
                  <div className="text-3xl">{unlocked ? cat.emojis[item.id] ?? '🎁' : '🔒'}</div>
                  <div className="text-white text-xs mt-1 leading-tight">{item.name}</div>
                  {!unlocked && (
                    <div className="text-yellow-400 text-xs">Lv {item.unlockedAtLevel}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// DataScreen — export / import
// ============================================================

export function DataScreen() {
  const { exportData, importData } = useApp();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const json = ev.target?.result as string;
      const success = importData(json);
      setImportStatus(success ? '✅ Data imported successfully!' : '❌ Invalid backup file');
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 pb-8">
      <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
        💾 Data Backup
      </h2>

      <div className="space-y-4">
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-2">📤 Export</h3>
          <p className="text-white/60 text-sm mb-3">Download all data as a JSON backup file.</p>
          <button
            onClick={handleExport}
            className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl active:scale-95 transition-all"
          >
            Download Backup
          </button>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-2">📥 Import</h3>
          <p className="text-white/60 text-sm mb-3">Restore from a previous backup. This will overwrite current data.</p>
          <label className="block w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl text-center cursor-pointer active:scale-95 transition-all">
            Choose Backup File
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          {importStatus && (
            <div className="mt-2 text-center text-sm font-bold text-white">{importStatus}</div>
          )}
        </div>

        <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-4 text-sm text-amber-200">
          ⚠️ Data is stored in <code className="text-amber-100">data/dashboard.json</code> on the server. Export regularly to keep a backup!
        </div>
      </div>
    </div>
  );
}
