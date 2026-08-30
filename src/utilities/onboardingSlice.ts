import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { clearSession } from '@features/auth/sessionSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Tour ids are kept identical to the ones the zena web app writes into
 * `profile.completedTours`, so that if a `completed_tours` column is ever added
 * to the backend the two can be reconciled without a migration here.
 */
export type TourId =
  | 'closet-tour'
  | 'stylist-tour'
  | 'sl-tour'
  | 'agenda-tour'
  | 'discover-tour'
  | 'home-saved';

export interface OnboardingState {
  /** Ids of tours the user has already dismissed. Persisted on-device only. */
  completedTours: TourId[];
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: OnboardingState = {
  completedTours: [],
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
  },
  extraReducers: builder => {
    // Tours are per-user. Without this, the next account signing in on this
    // device would inherit the previous user's dismissals and never see them.
    builder.addCase(clearSession, () => initialState);
  },
});

export const { markTourCompleted } = onboardingSlice.actions;
export default onboardingSlice.reducer;
