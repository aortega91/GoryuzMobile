import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { Trip } from '../types';

export async function fetchTrips(): Promise<Trip[]> {
  return apiGet<Trip[]>('/trips');
}

export async function createTrip(trip: Omit<Trip, 'id'> & { id?: string }): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/trips', trip);
}

export async function updateTrip(trip: Trip): Promise<{ success: boolean }> {
  return apiPut<{ success: boolean }>(`/trips/${trip.id}`, trip);
}

export async function deleteTrip(id: string): Promise<void> {
  await apiDelete(`/trips/${id}`);
}