export type Occasion = 'work' | 'casual' | 'date' | 'party' | 'sport' | 'travel' | 'home';

export interface ScheduleClothingItem {
  id: string;
  name: string;
  category: string;
  imageData: string | null;
}

export interface ScheduleOutfit {
  id: string;
  name: string;
  imageData: string | null;
  items: ScheduleClothingItem[];
}

export interface CalendarEvent {
  id: string;
  date: string;
  outfitId: string | null;
  occasion: Occasion | null;
  weatherSnapshot: string | null;
  rating: number | null;
  outfit: ScheduleOutfit | null;
}

/**
 * Motive of an agenda plan — mirrors zena `src/constants/agendaMotives.ts`.
 * "Travel" is not a motive: any plan can involve travelling, and what marks it
 * as a trip is having a destination.
 */
export type AgendaMotive =
  | 'work'
  | 'interview'
  | 'party'
  | 'date'
  | 'vacation'
  | 'sport'
  | 'family'
  | 'study'
  | 'other';

export type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'snowy';

/**
 * One day of forecast, in the exact shape zena stores in `trips.dailyWeather`
 * (`src/types/index.ts` DailyWeather) — the web reads the same rows, so the
 * app must write this shape and not the raw Open-Meteo one.
 */
export interface DayWeather {
  date: string; // YYYY-MM-DD
  min: number;
  max: number;
  type: WeatherType | string;
}

/**
 * An agenda plan. The backend still calls it a trip (`/trips`), but zena
 * generalised it: a motive, an optional start time and an optional
 * destination ("" when the plan doesn't travel).
 */
export interface Trip {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  destination: string;
  motive: AgendaMotive | null;
  startTime: string | null; // "HH:MM"
  lat: number | null;
  lng: number | null;
  weatherForecast: string | null;
  dailyWeather: DayWeather[] | null;
}

/** Raw Open-Meteo daily forecast, used for the live forecasts. */
export interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

export function weatherCodeToType(code: number): WeatherType {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'partly-cloudy';
  if (code <= 48) return 'cloudy';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rainy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowy';
  if (code >= 95) return 'rainy';
  return 'cloudy';
}

export function toDayWeather(d: DailyWeather): DayWeather {
  return { date: d.date, min: d.tempMin, max: d.tempMax, type: weatherCodeToType(d.weatherCode) };
}
