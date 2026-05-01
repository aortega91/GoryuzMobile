import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { clearSession } from '@features/auth/sessionSlice';
import { fetchProfile, UserProfile } from './api/profileApi';

// ─── Async thunk ──────────────────────────────────────────────────────────────

/**
 * Fetch the current user's profile from the API.
 * Dispatching this when profile is already loaded is safe — callers should
 * gate on `status === 'idle'` to avoid redundant requests.
 */
export const loadProfile = createAsyncThunk('profile/load', () =>
  fetchProfile(),
);

// ─── State ────────────────────────────────────────────────────────────────────

export interface ProfileState {
  data: UserProfile | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  status: 'idle',
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
    updateProfileLocally(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadProfile.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'success';
        state.error = null;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Failed to load profile';
      })
      // Auto-clear when the user signs out
      .addCase(clearSession, state => {
        state.data = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { clearProfile, updateProfileLocally } = profileSlice.actions;
export default profileSlice.reducer;
