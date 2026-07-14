// ============================================================
// AdminDashboard — parent-only area with nav tabs
// ============================================================

import React, { useRef, useState } from 'react';
import { useApp } from '../hooks/useApp';
import { HistoryScreen } from './HistoryScreen';
import { ReportsScreen } from './ReportsScreen';
import { SettingsScreen, type SettingsScreenHandle } from './SettingsScreen';
import { GoalsScreen, AchievementsScreen, AvatarScreen, DataScreen } from './ExtraScreens';
import { getTheme } from '../data/themes';
import { Check, X } from 'lucide-react';

type AdminTab = 'history' | 'reports' | 'goals' | 'achievements' | 'avatar' | 'settings' | 'data';

interface AdminDashboardProps {
  onClose: () => void;
}

const TABS: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: 'history',      label: 'History',      icon: '📅' },
  { id: 'reports',      label: 'Reports',      icon: '📊' },
  { id: 'goals',        label: 'Goals',        icon: '🎯' },
  { id: 'achievements', label: 'Badges',       icon: '🏅' },
  { id: 'avatar',       label: 'Avatar',       icon: '🎭' },
  { id: 'settings',     label: 'Settings',     icon: '⚙️' },
  { id: 'data',         label: 'Backup',       icon: '💾' },
];

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('settings');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const settingsRef = useRef<SettingsScreenHandle>(null);
  const { state } = useApp();
  const theme = getTheme(state.settings.theme);

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col min-h-0"
      style={{ background: theme.adminBackground }}
    >
      {/* Admin header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-900 font-black"
            style={{ backgroundColor: theme.accent }}
          >
            P
          </div>
          <div>
            <div className="text-white font-black text-sm">Parent Admin</div>
            <div className="text-white/40 text-xs">Protected Area</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'settings' && (
            <button
              type="button"
              onClick={() => settingsRef.current?.save()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all ${
                settingsSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500 hover:bg-green-400 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              {settingsSaved ? 'Saved' : 'Save'}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>

      {/* Tab bar — horizontal scroll */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-white/10 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold
              transition-all active:scale-95
              ${activeTab === tab.id
                ? 'text-gray-900'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }
            `}
            style={activeTab === tab.id ? { backgroundColor: theme.accent } : undefined}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content — min-h-0 lets nested scroll areas work inside flex layout */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'history'      && <HistoryScreen />}
        {activeTab === 'reports'      && <ReportsScreen />}
        {activeTab === 'goals'        && <GoalsScreen />}
        {activeTab === 'achievements' && <AchievementsScreen />}
        {activeTab === 'avatar'       && <AvatarScreen />}
        {activeTab === 'settings'     && (
          <SettingsScreen ref={settingsRef} onSavedChange={setSettingsSaved} />
        )}
        {activeTab === 'data'         && <DataScreen />}
      </div>
    </div>
  );
}
