import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { CalendarEvent } from '../types';

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  return apiGet<CalendarEvent[]>('/calendar');
}

export async function addCalendarEvent(params: {
  date: string;
  outfitId: string;
  occasion?: string;
  weatherSnapshot?: string;
}): Promise<CalendarEvent> {
  return apiPost<CalendarEvent>('/calendar', params);
}

export async function updateCalendarEvent(
  id: string,
  updates: { date?: string; occasion?: string; weatherSnapshot?: string },
): Promise<CalendarEvent> {
  return apiPut<CalendarEvent>(`/calendar/${id}`, updates);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await apiDelete(`/calendar/${id}`);
}