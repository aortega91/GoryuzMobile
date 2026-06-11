import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { clearSession } from '@features/auth/sessionSlice';
import { ClothingItem } from '@features/collection/types';
import { fetchRecommendations } from './api/discoverApi';
import { RecommendedItem } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileSnapshot {
  stylePrompt?: string | null;
  gender?: string | null;
  styleSummary?: string | null;
}

interface DiscoverState {
  // AI-generated catalog recommendations. Lives in Redux (not component state)
  // so it survives the Discover screen unmounting/remounting on drawer
  // navigation — otherwise each remount would re-trigger a gem-charged fetch.
  catalog: RecommendedItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DiscoverState = {
  catalog: [],
  status: 'idle',
  error: null,
};

// ─── Thunk ──────────────────────────────────────────────────────────────────
// POST /gemini/recommendations — costs gems, so it must only run on an explicit
// user action (Generate button / pull-to-refresh / refresh FAB), never on mount.

export const loadRecommendations = createAsyncThunk(
  'discover/loadRecommendations',
  (args: { closet: ClothingItem[]; profile: ProfileSnapshot }) =>
    fetchRecommendations(args),
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadRecommendations.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadRecommendations.fulfilled, (state, action) => {
        state.catalog = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadRecommendations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load recommendations';
      })
      // Drop the cached catalog on logout so the next user doesn't see it.
      .addCase(clearSession, () => initialState);
  },
});

export default discoverSlice.reducer;
