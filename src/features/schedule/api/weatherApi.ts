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

/**
 * Loose geocoding, like zena's `fetchCoordinatesFallback`: first Nominatim hit
 * or null. A destination that can't be located still saves — the plan just
 * gets no forecast.
 */
export async function geocodeCoordinates(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'GoryuzMobile/1.0' } });
  if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
  const results = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}
