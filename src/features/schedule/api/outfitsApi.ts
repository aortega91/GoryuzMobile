import { apiGet } from '@api/client';
import { ScheduleOutfit } from '../types';

export async function fetchOutfits(): Promise<ScheduleOutfit[]> {
  return apiGet<ScheduleOutfit[]>('/outfits');
}