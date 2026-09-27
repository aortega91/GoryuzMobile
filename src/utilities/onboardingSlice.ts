import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { clearSession } from '@features/auth/sessionSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Tour ids are kept identical to the ones the zena web app writes into
 * `profile.completedTours`, so that if a `completed_tours` column is ever added
 * to the backend the two can be reconciled without a migration here.
 *
 * 'stylist-tour' / 'sl-tour' / 'agenda-tour' were dropped: those modules now
 * have a bottom submodules bar, so their first-open explanation is the
 * `SubmodulesCoachMark` (see `seenSubmoduleHints` below) instead of this
 * centered welcome checklist.
 */
export type TourId =
  | 'closet-tour'
  | 'discover-tour'
  | 'home-saved';

/**
 * View ids for the submodule bottom-tab coachmark, kept identical to the
 * strings the zena web app passes as `viewId` to its `SubmodulesCoachMark` (a
 * separate, localStorage-only tracker there — not part of `completedTours`).
 */
export type SubmoduleHintViewId = 'agenda' | 'profile' | 'connections' | 'second-life' | 'stylist';

export interface OnboardingState {
  /** Ids of tours the user has already dismissed. Persisted on-device only. */
  completedTours: TourId[];
  /** Ids of submodule bottom-tab coachmarks the user has already dismissed. */
  seenSubmoduleHints: SubmoduleHintViewId[];
  /**
   * Drawer modules the user has opened at least once — drives the "not
   * visited yet" dot, mirroring zena's `useVisitedModules` (localStorage there).
   */
  visitedModules: string[];
  /** Whether the Home "first steps" checklist is collapsed (zena keeps it in localStorage). */
  homeChecklistCollapsed: boolean;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: OnboardingState = {
  completedTours: [],
  seenSubmoduleHints: [],
  visitedModules: [],
  homeChecklistCollapsed: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    markTourCompleted(state, action: PayloadAction<TourId>) {
      if (!state.completedTours.includes(action.payload)) {
        state.completedTours.push(action.payload);
      }
    },
    markSubmoduleHintSeen(state, action: PayloadAction<SubmoduleHintViewId>) {
      if (!state.seenSubmoduleHints.includes(action.payload)) {
        state.seenSubmoduleHints.push(action.payload);
      }
    },
    markModuleVisited(state, action: PayloadAction<string>) {
      if (!state.visitedModules.includes(action.payload)) {
        state.visitedModules.push(action.payload);
      }
    },
    setHomeChecklistCollapsed(state, action: PayloadAction<boolean>) {
      state.homeChecklistCollapsed = action.payload;
    },
  },
  extraReducers: builder => {
    // Tours are per-user. Without this, the next account signing in on this
    // device would inherit the previous user's dismissals and never see them.
    builder.addCase(clearSession, () => initialState);

    // Devices that installed the app before `seenSubmoduleHints` existed have
    // a persisted `onboarding` blob shaped like the old state (just
    // `completedTours`) — rehydrating it verbatim leaves the new field
    // `undefined` and crashes any `.includes()` on it. Backfill defaults for
    // any field missing from what was actually persisted.
    builder.addMatcher(
      (action): action is { type: typeof REHYDRATE; payload?: { onboarding?: Partial<OnboardingState> } } =>
        action.type === REHYDRATE,
      (state, action) => {
        const persisted = action.payload?.onboarding;
        if (!persisted) return state;
        return {
          completedTours: persisted.completedTours ?? initialState.completedTours,
          seenSubmoduleHints: persisted.seenSubmoduleHints ?? initialState.seenSubmoduleHints,
          visitedModules: persisted.visitedModules ?? initialState.visitedModules,
          homeChecklistCollapsed:
            persisted.homeChecklistCollapsed ?? initialState.homeChecklistCollapsed,
        };
      },
    );
  },
});

export const {
  markTourCompleted,
  markSubmoduleHintSeen,
  markModuleVisited,
  setHomeChecklistCollapsed,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
