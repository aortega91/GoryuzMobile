/**
 * Guided colour test — zena `/api/gemini/colorimetry` (5 gems, charged by the
 * zena middleware; callers dispatch `loadProfile()` after a success) and the
 * profile write zena's StylistView does once the result is in.
 */
import { apiPost } from '@api/client';
import { UserProfile } from '@features/home/api/profileApi';
import type { ColorimetryProfile, GuidedColorimetryPayload, GuidedColorimetryResult } from '../colorimetry/types';

export function analyzeColorimetry(params: {
  imageBase64: string;
  mimeType: string;
  guided: GuidedColorimetryPayload;
}): Promise<GuidedColorimetryResult> {
  return apiPost<GuidedColorimetryResult>('/gemini/colorimetry', params);
}

/**
 * POST /profile with the full result plus the three legacy fields the drapes
 * and garment compatibility still read. Kept here rather than in the shared
 * `UpdateProfilePayload` because only this flow writes `colorimetryProfile`.
 */
export function saveColorimetryProfile(patch: {
  colorimetryProfile: ColorimetryProfile;
  colorSeason: string;
  colorimetryResult: string;
  colorPalette: string[];
}): Promise<UserProfile> {
  return apiPost<UserProfile>('/profile', patch);
}
