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

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination: string;
  lat: number | null;
  lng: number | null;
  weatherForecast: string | null;
  dailyWeather: DailyWeather[] | null;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

export type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'snowy';

export function weatherCodeToType(code: number): WeatherType {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'partly-cloudy';
  if (code <= 48) return 'cloudy';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rainy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowy';
  if (code >= 95) return 'rainy';
  return 'cloudy';
}
