// ============================================================
// App — root component, manages home vs admin routing
// ============================================================

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './hooks/useApp';
import { HomeScreen } from './components/HomeScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { PinEntry } from './components/PinEntry';
import { ThemeBackground } from './components/ThemeBackground';
import { shouldNightDim } from './utils/nightDim';
import { DEFAULT_TIMEZONE } from './utils/storage';

type AppView = 'home' | 'pinEntry' | 'admin';

function AppInner() {
  const [view, setView] = useState<AppView>('home');
  const { state } = useApp();
  const childName = state.settings.childName?.trim() || 'Mission';
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    document.title = `${childName}'s Mission Dashboard`;
  }, [childName]);

  // Re-check dim schedule every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const dimActive =
    view !== 'admin' &&
    shouldNightDim({
      mode: state.settings.nightDimMode ?? 'off',
      start: state.settings.nightDimStart || '21:00',
      end: state.settings.nightDimEnd || '06:00',
      timeZone: state.settings.timezone || DEFAULT_TIMEZONE,
      now,
    });

  return (
    <div
      className="relative z-10 w-screen h-screen overflow-hidden font-nunito"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      <ThemeBackground themeId={state.settings.theme} />
      {view === 'home' && (
        <HomeScreen onOpenAdmin={() => setView('pinEntry')} />
      )}
      {view === 'pinEntry' && (
        <>
          <HomeScreen onOpenAdmin={() => {}} />
          <PinEntry
            onSuccess={() => setView('admin')}
            onCancel={() => setView('home')}
          />
        </>
      )}
      {view === 'admin' && (
        <AdminDashboard onClose={() => setView('home')} />
      )}
      {dimActive && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] bg-black/58 transition-opacity duration-700"
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
