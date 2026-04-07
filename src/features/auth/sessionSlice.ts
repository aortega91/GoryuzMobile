import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface SessionState {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: SessionState = {
  user: null,
  isAuthenticated: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<SessionUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearSession(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
