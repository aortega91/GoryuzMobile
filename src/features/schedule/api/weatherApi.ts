import i18n from '@language/index';
import { DailyWeather } from '../types';

export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days = 16,
): Promise<DailyWeather[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };
  return data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i] ?? 0,
    tempMax: Math.round(data.daily.temperature_2m_max[i] ?? 0),
    tempMin: Math.round(data.daily.temperature_2m_min[i] ?? 0),
  }));
}

export async function geocodeDestination(
  query: string,
): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const city = query.split(',')[0].trim();
  const countryHint = query.includes(',') ? query.split(',').slice(1).join(',').trim().toLowerCase() : '';

  const lang = i18n.language ?? 'es';
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=${lang}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'GoryuzMobile/1.0' } });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      address: {
        city?: string;
        town?: string;
        village?: string;
        country?: string;
      };
    }>;
    if (results.length === 0) return null;

    const match = countryHint
      ? results.find(r =>
          r.address.country?.toLowerCase().includes(countryHint) ||
          r.display_name.toLowerCase().includes(countryHint),
        )
      : results[0];
    const best = match ?? results[0];
    if (!best.address.city && !best.address.town && !best.address.village) return null;

    return {
      lat: parseFloat(best.lat),
      lon: parseFloat(best.lon),
      displayName: `${best.address.city ?? best.address.town ?? best.address.village ?? city}, ${best.address.country ?? ''}`.trim(),
    };
  } catch {
    return null;
  }
}