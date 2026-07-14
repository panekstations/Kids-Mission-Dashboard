// ============================================================
// WeatherForecast — compact 5-day strip for top bar
// ============================================================

import React, { useEffect, useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fetchForecastForZip, type ForecastDay } from '../utils/weather';

const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

export function WeatherForecast() {
  const { state } = useApp();
  const zip = state.settings.weatherZip || '60622';
  const [days, setDays] = useState<ForecastDay[] | null>(null);
  const [label, setLabel] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const forecast = await fetchForecastForZip(zip);
        if (mounted) {
          setDays(forecast.days);
          setLabel(forecast.location.label);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      }
    };

    setDays(null);
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [zip]);

  if (error) {
    return (
      <div className="text-white/40 text-sm text-center px-2">
        Weather unavailable
      </div>
    );
  }

  if (!days) {
    return (
      <div className="flex gap-2.5 justify-center px-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-12 h-14 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-2 min-w-0">
      <div className="text-white/50 text-xs font-bold tracking-wide mb-1 truncate max-w-full">
        {label}
      </div>
      <div className="flex gap-2 justify-center">
        {days.map(day => (
          <div
            key={day.date}
            className="flex flex-col items-center bg-white/10 rounded-lg px-2 py-1.5 min-w-[3.25rem]"
            title={`${day.label}: ${day.highF}° / ${day.lowF}°`}
          >
            <div className="text-white/60 text-xs font-bold leading-none">{day.label}</div>
            <div className="text-2xl leading-none my-1">{day.icon}</div>
            <div className="text-white font-black text-base leading-none">{day.highF}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
