/**
 * profileApi.ts — Home feature API
 *
 * Fetches the current user's profile from GET /profile.
 * Kept here (home/api/) because profile data is loaded at the app's entry
 * point (Home screen) and is not scoped to a single other feature.
 *
 * Response shape based on https://preview.goryuz.com/api/profile
 */

import { apiGet } from '@api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImpactStats {
  sold: number;
  gifted: number;
  traded: number;
}

export interface UserProfile {
  id: string;
  createdAt: string;
  email: string;
  phone: string | null;
  name: string;
  avatarUrl: string | null;
  /** Total spendable tokens (subscriptionTokens + purchasedTokens) */
  tokens: number;
  plan: 'free' | 'premium' | string;
  styleSummary: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: string | null;
  dob: string | null;
  country: string | null;
  outfitRepetitionDays: number;
  nickname: string;
  stylePrompt: string | null;
  stylePromptImage: string | null;
  currency: string;
  language: string;
  aiName: string;
  showDiscover: boolean;
  useAdvancedModel: boolean;
  useAvatarGeneration: boolean;
  subscriptionTokens: number;
  purchasedTokens: number;
  gender: string | null;
  avatarDescription: string | null;
  avatarImage: string | null;
  impactStats: ImpactStats;
  marketplaceFavorites: string[];
  termsAccepted: boolean;
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's profile.
 * Uses GET https://preview.goryuz.com/api/profile
 */
export function fetchProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/profile');
}
