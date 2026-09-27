import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { AgendaMotive, DayWeather, Trip, toDayWeather } from '../types';
import { AGENDA_MOTIVE_IDS } from '../motives';

// The backend keeps the historical `/trips` route for agenda plans (zena
// `src/pages/api/trips`); only the fields grew: motive + startTime.

type RawTrip = Partial<Omit<Trip, 'dailyWeather'>> & {
  id: string;
  dailyWeather?: unknown;
};

/**
 * Rows written by older app builds stored Open-Meteo's shape
 * (`weatherCode/tempMax/tempMin`); the web writes `{ date, min, max, type }`.
 * Both are accepted and normalised to the web's shape.
 */
function normaliseDailyWeather(raw: unknown): DayWeather[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .map((item: unknown): DayWeather | null => {
      if (!item || typeof item !== 'object') return null;
      const d = item as Record<string, unknown>;
      if (typeof d.date !== 'string') return null;
      if (typeof d.max === 'number' && typeof d.min === 'number') {
        return { date: d.date, min: d.min, max: d.max, type: String(d.type ?? 'sunny') };
      }
      if (typeof d.tempMax === 'number' && typeof d.tempMin === 'number') {
        return toDayWeather({
          date: d.date,
          tempMax: d.tempMax,
          tempMin: d.tempMin,
          weatherCode: Number(d.weatherCode ?? 0),
        });
      }
      return null;
    })
    .filter((d): d is DayWeather => d !== null);
}

function normaliseTrip(raw: RawTrip): Trip {
  const motive = AGENDA_MOTIVE_IDS.includes(raw.motive as AgendaMotive)
    ? (raw.motive as AgendaMotive)
    : null;
  return {
    id: raw.id,
    name: raw.name ?? '',
    startDate: raw.startDate ?? '',
    endDate: raw.endDate ?? raw.startDate ?? '',
    destination: raw.destination ?? '',
    motive,
    startTime: raw.startTime || null,
    lat: typeof raw.lat === 'number' ? raw.lat : null,
    lng: typeof raw.lng === 'number' ? raw.lng : null,
    weatherForecast: raw.weatherForecast ?? null,
    dailyWeather: normaliseDailyWeather(raw.dailyWeather),
  };
}

/**
 * The web's zod schemas take optional numbers/strings but reject `null`, so
 * empty fields are dropped from the body instead of sent as null. `startTime`,
 * `weatherForecast` and `dailyWeather` go as ""/[] on purpose: the PUT only
 * overwrites defined fields, and that is how a cleared value gets cleared.
 */
function toPayload(trip: Trip): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    destination: trip.destination,
    motive: trip.motive ?? 'other',
    startTime: trip.startTime ?? '',
    weatherForecast: trip.weatherForecast ?? '',
    dailyWeather: trip.dailyWeather ?? [],
  };
  if (trip.lat != null) body.lat = trip.lat;
  if (trip.lng != null) body.lng = trip.lng;
  return body;
}

export async function fetchTrips(): Promise<Trip[]> {
  const rows = await apiGet<RawTrip[]>('/trips');
  return (rows ?? []).map(normaliseTrip);
}

export async function createTrip(trip: Trip): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/trips', { id: trip.id, ...toPayload(trip) });
}

export async function updateTrip(trip: Trip): Promise<{ success: boolean }> {
  return apiPut<{ success: boolean }>(`/trips/${trip.id}`, toPayload(trip));
}

export async function deleteTrip(id: string): Promise<void> {
  await apiDelete(`/trips/${id}`);
}
