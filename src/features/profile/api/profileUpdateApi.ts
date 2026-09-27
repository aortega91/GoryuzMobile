import { apiGet, apiPost, apiDelete } from '@api/client';
import { ImpactStats, UserProfile } from '@features/home/api/profileApi';

export interface UpdateProfilePayload {
  impactStats?: ImpactStats;
  /**
   * How the app addresses the user. The name comes locked from the Google
   * account, so this is the editable override; empty = use the name
   * (zena `getDisplayName`). Send it trimmed.
   */
  alias?: string;
  /** The unique @handle. Validated + normalised server-side (400 / 409). */
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'neutral';
  aiName?: string;
  language?: string;
  currency?: string;
  avatarUrl?: string;
  stylePrompt?: string;
  stylePromptImage?: string;
  avatarDescription?: string;
  avatarImage?: string;
  bodyImage?: string;
  faceImage?: string;
  faceAvatarImage?: string;
  useAvatarGeneration?: boolean;
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

// ─── Nickname (@handle) rules — mirror of zena `src/lib/nickname.ts` ─────────

/** 3–20 chars: lowercase letters, digits, dot or underscore. */
export const NICKNAME_PATTERN = /^[a-z0-9._]{3,20}$/;
export const NICKNAME_MAX_LENGTH = 20;
/** zena caps the alias input at 40 chars. */
export const ALIAS_MAX_LENGTH = 40;

/** Handles are case-insensitive: stored and compared lowercase, without a leading @. */
export function normalizeNickname(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, '');
}

export function isValidNickname(value: string): boolean {
  return NICKNAME_PATTERN.test(value);
}

export interface NicknameAvailability {
  available: boolean;
  reason: 'invalid' | 'taken' | null;
}

/**
 * GET /profile/nickname?nickname=… — is this handle free? Only a hint while
 * typing: POST /profile re-checks and answers 409 if someone took it meanwhile.
 */
export function checkNicknameAvailability(nickname: string): Promise<NicknameAvailability> {
  return apiGet<NicknameAvailability>(
    `/profile/nickname?nickname=${encodeURIComponent(nickname)}`,
  );
}
