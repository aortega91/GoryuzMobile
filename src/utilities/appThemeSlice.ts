import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeId, DEFAULT_THEME_ID } from '@theme/palettes';

interface AppThemeState {
  themeId: ThemeId;
}

const initialState: AppThemeState = {
  themeId: DEFAULT_THEME_ID,
};

const appThemeSlice = createSlice({
  name: 'appTheme',
  initialState,
  reducers: {
    setThemeId(state, action: PayloadAction<ThemeId>) {
      state.themeId = action.payload;
    },
  },
});

export const { setThemeId } = appThemeSlice.actions;
export default appThemeSlice.reducer;
