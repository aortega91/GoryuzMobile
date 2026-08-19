import { apiPost, apiDelete } from '@api/client';
import { ImpactStats, UserProfile } from '@features/home/api/profileApi';

export interface UpdateProfilePayload {
  impactStats?: ImpactStats;
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'neutral';
  aiName?: string;
  language?: string;
  currency?: string;
  avatarUrl?: string;
  outfitRepetitionDays?: number;
  stylePrompt?: string;
  stylePromptImage?: string;
  avatarDescription?: string;
  avatarImage?: string;
  bodyImage?: string;
  avatarPrompt?: string;
  colorSeason?: string;
  colorimetryResult?: string;
  colorPalette?: string[];
  availableTags?: string[];
  useAdvancedModel?: boolean;
}

export function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiPost<UserProfile>('/profile', payload);
}

export function deleteAccount(): Promise<void> {
  return apiDelete<void>('/profile');
}
