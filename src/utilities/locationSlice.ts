import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  cityName: string | null;
}

const locationSlice = createSlice({
  name: 'location',
  initialState: { cityName: null } as LocationState,
  reducers: {
    setCityName(state, action: PayloadAction<string | null>) {
      state.cityName = action.payload;
    },
  },
});

export const { setCityName } = locationSlice.actions;
export default locationSlice.reducer;
