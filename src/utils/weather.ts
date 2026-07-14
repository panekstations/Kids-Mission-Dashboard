// ============================================================
// Weather — 5-day forecast by US ZIP (Open-Meteo, free)
// ============================================================

import { DEFAULT_TIMEZONE } from './storage';

const DEFAULT_LOCATION = {
  zip: '60622',
  lat: 41.9047,
  lon: -87.6768,
  label: 'CHICAGO 60622',
  timezone: DEFAULT_TIMEZONE,
};

export interface WeatherLocation {
  zip: string;
  lat: number;
  lon: number;
  label: string;
  timezone: string;
}

export interface ForecastDay {
  date: string;
  label: string;
  highF: number;
  lowF: number;
  icon: string;
}

export interface WeatherForecastResult {
  location: WeatherLocation;
  days: ForecastDay[];
}

/** WMO weather code → emoji for kid-friendly display */
export function weatherCodeToIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '❄️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

function dayLabel(dateStr: string, index: number, timezone: string): string {
  if (index === 0) return 'Today';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone });
}

function normalizeZip(zip: string): string {
  return zip.replace(/\D/g, '').slice(0, 5);
}

/** Resolve a US ZIP to lat/lon via Open-Meteo geocoding */
export async function resolveZipLocation(zipInput: string): Promise<WeatherLocation> {
  const zip = normalizeZip(zipInput) || DEFAULT_LOCATION.zip;
  if (zip === DEFAULT_LOCATION.zip) {
    return { ...DEFAULT_LOCATION };
  }

  const params = new URLSearchParams({
    name: zip,
    count: '5',
    language: 'en',
    format: 'json',
    countryCode: 'US',
  });

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!res.ok) throw new Error('Geocoding failed');

  const data = await res.json();
  const results: Array<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    timezone?: string;
    postcodes?: string[];
  }> = data.results ?? [];

  const match =
    results.find(r => r.postcodes?.some(pc => pc.startsWith(zip))) ??
    results[0];

  if (!match) {
    throw new Error(`No location found for ZIP ${zip}`);
  }

  const city = (match.name || 'Local').toUpperCase();
  const region = match.admin1 ? ` ${match.admin1}` : '';
  return {
    zip,
    lat: match.latitude,
    lon: match.longitude,
    label: `${city}${region} ${zip}`.trim(),
    timezone: match.timezone || DEFAULT_TIMEZONE,
  };
}

export async function fetchForecastForZip(zip: string): Promise<WeatherForecastResult> {
  const location = await resolveZipLocation(zip);
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: location.timezone,
    forecast_days: '5',
    temperature_unit: 'fahrenheit',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');

  const data = await res.json();
  const daily = data.daily;
  if (!daily?.time) throw new Error('Invalid weather data');

  const days = daily.time.map((date: string, i: number) => ({
    date,
    label: dayLabel(date, i, location.timezone),
    highF: Math.round(daily.temperature_2m_max[i]),
    lowF: Math.round(daily.temperature_2m_min[i]),
    icon: weatherCodeToIcon(daily.weather_code[i]),
  }));

  return { location, days };
}

/** @deprecated Prefer fetchForecastForZip */
export async function fetchChicagoForecast(): Promise<ForecastDay[]> {
  const result = await fetchForecastForZip(DEFAULT_LOCATION.zip);
  return result.days;
}
