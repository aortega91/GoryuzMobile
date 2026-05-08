import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { logError } from '@utilities/crashlytics';
import { CalendarEvent, Trip, ScheduleOutfit } from './types';
import {
  fetchCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from './api/calendarApi';
import { fetchTrips, createTrip, updateTrip, deleteTrip } from './api/tripsApi';
import { fetchOutfits } from './api/outfitsApi';

// ─── State ────────────────────────────────────────────────────────────────────

interface ScheduleState {
  events: CalendarEvent[];
  trips: Trip[];
  outfits: ScheduleOutfit[];
  eventsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  tripsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  outfitsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ScheduleState = {
  events: [],
  trips: [],
  outfits: [],
  eventsStatus: 'idle',
  tripsStatus: 'idle',
  outfitsStatus: 'idle',
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loadEvents = createAsyncThunk('schedule/loadEvents', async () =>
  fetchCalendarEvents(),
);

export const loadTrips = createAsyncThunk('schedule/loadTrips', async () =>
  fetchTrips(),
);

export const loadOutfits = createAsyncThunk('schedule/loadOutfits', async () =>
  fetchOutfits(),
);

export const addEvent = createAsyncThunk(
  'schedule/addEvent',
  async (params: { date: string; outfitId: string; weatherSnapshot?: string }) =>
    addCalendarEvent(params),
);

export const removeEvent = createAsyncThunk(
  'schedule/removeEvent',
  async (eventId: string) => {
    await deleteCalendarEvent(eventId);
    return eventId;
  },
);

export const moveEvent = createAsyncThunk(
  'schedule/moveEvent',
  async ({ eventId, newDate }: { eventId: string; newDate: string }) => {
    await updateCalendarEvent(eventId, { date: newDate });
    return { eventId, newDate };
  },
);

export const saveTrip = createAsyncThunk(
  'schedule/saveTrip',
  async (trip: Trip) => {
    const { id } = await createTrip(trip);
    return { ...trip, id };
  },
);

export const editTrip = createAsyncThunk(
  'schedule/editTrip',
  async (trip: Trip) => {
    await updateTrip(trip);
    return trip;
  },
);

export const removeTrip = createAsyncThunk(
  'schedule/removeTrip',
  async (tripId: string) => {
    await deleteTrip(tripId);
    return tripId;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Events
    builder
      .addCase(loadEvents.pending, state => { state.eventsStatus = 'loading'; })
      .addCase(loadEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.eventsStatus = 'succeeded';
        state.events = action.payload;
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.eventsStatus = 'failed';
        logError(new Error(action.error.message ?? 'loadEvents failed'), 'schedule/loadEvents');
      });

    builder
      .addCase(addEvent.fulfilled, (state, action: PayloadAction<CalendarEvent>) => {
        state.events.push(action.payload);
      })
      .addCase(addEvent.rejected, (_, action) => {
        logError(new Error(action.error.message ?? 'addEvent failed'), 'schedule/addEvent');
      });

    builder
      .addCase(removeEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.events = state.events.filter(e => e.id !== action.payload);
      })
      .addCase(removeEvent.rejected, (_, action) => {
        logError(new Error(action.error.message ?? 'removeEvent failed'), 'schedule/removeEvent');
      });

    builder
      .addCase(moveEvent.fulfilled, (state, action: PayloadAction<{ eventId: string; newDate: string }>) => {
        const event = state.events.find(e => e.id === action.payload.eventId);
        if (event) event.date = action.payload.newDate;
      })
      .addCase(moveEvent.rejected, (_, action) => {
        logError(new Error(action.error.message ?? 'moveEvent failed'), 'schedule/moveEvent');
      });

    // Trips
    builder
      .addCase(loadTrips.pending, state => { state.tripsStatus = 'loading'; })
      .addCase(loadTrips.fulfilled, (state, action: PayloadAction<Trip[]>) => {
        state.tripsStatus = 'succeeded';
        state.trips = action.payload;
      })
      .addCase(loadTrips.rejected, (state, action) => {
        state.tripsStatus = 'failed';
        logError(new Error(action.error.message ?? 'loadTrips failed'), 'schedule/loadTrips');
      });

    builder
      .addCase(saveTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
        state.trips.push(action.payload);
      })
      .addCase(saveTrip.rejected, (_, action) => {
        logError(new Error(action.error.message ?? 'saveTrip failed'), 'schedule/saveTrip');
      });

    builder
      .addCase(editTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
        const idx = state.trips.findIndex(t => t.id === action.payload.id);
        if (idx >= 0) state.trips[idx] = action.payload;
      })
      .addCase(editTrip.rejected, (_, action) => {
        logError(new Error(action.error.message ?? 'editTrip failed'), 'schedule/editTrip');
      });

    builder
      .addCase(removeTrip.fulfilled, (state, action: PayloadAction<string>) => {
        state.trips = state.trips.filter(t => t.id !== action.payload);
      })
      .addCase(removeTrip.rejected, (_, action) => {
        logError(new Error(action.error.message ?? 'removeTrip failed'), 'schedule/removeTrip');
      });

    // Outfits
    builder
      .addCase(loadOutfits.pending, state => { state.outfitsStatus = 'loading'; })
      .addCase(loadOutfits.fulfilled, (state, action: PayloadAction<ScheduleOutfit[]>) => {
        state.outfitsStatus = 'succeeded';
        state.outfits = action.payload;
      })
      .addCase(loadOutfits.rejected, (state, action) => {
        state.outfitsStatus = 'failed';
        logError(new Error(action.error.message ?? 'loadOutfits failed'), 'schedule/loadOutfits');
      });
  },
});

export default scheduleSlice.reducer;