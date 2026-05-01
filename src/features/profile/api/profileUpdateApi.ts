import { apiPost, apiDelete } from '@api/client';
import { UserProfile } from '@features/home/api/profileApi';

export interface UpdateProfilePayload {
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'neutral';
  aiName?: string;
  language?: string;
  currency?: string;
  avatarUrl?: string;
  outfitRepetitionDays?: number;
}

export function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiPost<UserProfile>('/profile', payload);
}

export function deleteAccount(): Promise<void> {
  return apiDelete<void>('/profile');
}
