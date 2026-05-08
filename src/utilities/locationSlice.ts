import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  cityName: string | null;
  latitude: number | null;
  longitude: number | null;
}

const locationSlice = createSlice({
  name: 'location',
  initialState: { cityName: null, latitude: null, longitude: null } as LocationState,
  reducers: {
    setCityName(state, action: PayloadAction<string | null>) {
      state.cityName = action.payload;
    },
    setCoordinates(state, action: PayloadAction<{ latitude: number; longitude: number } | null>) {
      state.latitude = action.payload?.latitude ?? null;
      state.longitude = action.payload?.longitude ?? null;
    },
  },
});

export const { setCityName, setCoordinates } = locationSlice.actions;
export default locationSlice.reducer;
