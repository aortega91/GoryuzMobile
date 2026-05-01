import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppThemePreference = 'light' | 'dark' | 'system';

interface AppThemeState {
  preference: AppThemePreference;
}

const initialState: AppThemeState = {
  preference: 'system',
};

const appThemeSlice = createSlice({
  name: 'appTheme',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<AppThemePreference>) {
      state.preference = action.payload;
    },
  },
});

export const { setThemePreference } = appThemeSlice.actions;
export default appThemeSlice.reducer;
