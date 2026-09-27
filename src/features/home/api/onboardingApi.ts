/**
 * onboardingApi.ts — Home feature API
 *
 * The "first steps" checklist shown on Inicio. The server derives every task
 * from the user's real data (see zena `src/lib/server/onboarding.ts`), so the
 * client never marks anything done: it just asks again.
 *
 * Mirrors zena `src/services/api/onboarding.ts`:
 *   GET  /onboarding → OnboardingStatus
 *   POST /onboarding → claims the one-off gem reward once all tasks are done
 */

import { apiGet, apiPost } from '@api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Same order zena renders them in (`ONBOARDING_TASK_KEYS`). */
export const ONBOARDING_TASK_KEYS = [
  'firstItem',
  'firstOutfit',
  'avatar',
  'stylePrompt',
  'colorimetry',
  'firstTrip',
  'scheduleOutfit',
  'secondLife',
  'friend',
  'message',
] as const;

export type OnboardingTaskKey = (typeof ONBOARDING_TASK_KEYS)[number];

export interface OnboardingStatus {
  tasks: Record<OnboardingTaskKey, boolean>;
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
  rewardClaimed: boolean;
  rewardGems: number;
}

export interface ClaimOnboardingRewardResult {
  success: true;
  rewardGems: number;
  tokens: number;
  status: OnboardingStatus;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export function fetchOnboardingStatus(): Promise<OnboardingStatus> {
  return apiGet<OnboardingStatus>('/onboarding');
}

/**
 * The client sends nothing: the server re-evaluates the tasks and guards
 * against a double credit (409 if already claimed, 400 if not complete).
 */
export function claimOnboardingReward(): Promise<ClaimOnboardingRewardResult> {
  return apiPost<ClaimOnboardingRewardResult>('/onboarding', {});
}
