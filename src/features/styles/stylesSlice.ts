import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { logError } from '@utilities/crashlytics';
import { ClothingItem } from '@features/collection/types';
import { fetchCollection } from '@features/collection/api/collectionApi';
import { Outfit } from './types';
import {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
} from './api/stylesApi';

// ─── State ────────────────────────────────────────────────────────────────────

interface StylesState {
  outfits: Outfit[];
  closetItems: ClothingItem[];
  outfitsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  closetStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: StylesState = {
  outfits: [],
  closetItems: [],
  outfitsStatus: 'idle',
  closetStatus: 'idle',
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loadOutfits = createAsyncThunk('styles/loadOutfits', async () =>
  fetchOutfits(),
);

export const loadClosetItems = createAsyncThunk('styles/loadClosetItems', async () =>
  fetchCollection(),
);

export const addOutfit = createAsyncThunk(
  'styles/addOutfit',
  async (params: { name: string; itemIds: string[] }) => createOutfit(params),
);

export const editOutfit = createAsyncThunk(
  'styles/editOutfit',
  async ({
    id,
    ...params
  }: {
    id: string;
    name?: string;
    tags?: string[];
    rating?: number | null;
  }) => {
    await updateOutfit(id, params);
    return { id, ...params };
  },
);

export const removeOutfit = createAsyncThunk(
  'styles/removeOutfit',
  async (id: string) => {
    await deleteOutfit(id);
    return id;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const stylesSlice = createSlice({
  name: 'styles',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadOutfits.pending, state => {
        state.outfitsStatus = 'loading';
      })
      .addCase(loadOutfits.fulfilled, (state, action: PayloadAction<Outfit[]>) => {
        state.outfitsStatus = 'succeeded';
        state.outfits = action.payload;
      })
      .addCase(loadOutfits.rejected, (state, action) => {
        state.outfitsStatus = 'failed';
        logError(
          new Error(action.error.message ?? 'loadOutfits failed'),
          'styles/loadOutfits',
        );
      });

    builder
      .addCase(loadClosetItems.pending, state => {
        state.closetStatus = 'loading';
      })
      .addCase(loadClosetItems.fulfilled, (state, action: PayloadAction<ClothingItem[]>) => {
        state.closetStatus = 'succeeded';
        state.closetItems = action.payload;
      })
      .addCase(loadClosetItems.rejected, (state, action) => {
        state.closetStatus = 'failed';
        logError(
          new Error(action.error.message ?? 'loadClosetItems failed'),
          'styles/loadClosetItems',
        );
      });

    builder
      .addCase(addOutfit.fulfilled, (state, action: PayloadAction<Outfit>) => {
        state.outfits.unshift(action.payload);
      })
      .addCase(addOutfit.rejected, (_, action) => {
        logError(
          new Error(action.error.message ?? 'addOutfit failed'),
          'styles/addOutfit',
        );
      });

    builder
      .addCase(editOutfit.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        const outfit = state.outfits.find(o => o.id === id);
        if (outfit) {
          Object.assign(outfit, updates);
        }
      })
      .addCase(editOutfit.rejected, (_, action) => {
        logError(
          new Error(action.error.message ?? 'editOutfit failed'),
          'styles/editOutfit',
        );
      });

    builder
      .addCase(removeOutfit.fulfilled, (state, action: PayloadAction<string>) => {
        state.outfits = state.outfits.filter(o => o.id !== action.payload);
      })
      .addCase(removeOutfit.rejected, (_, action) => {
        logError(
          new Error(action.error.message ?? 'removeOutfit failed'),
          'styles/removeOutfit',
        );
      });
  },
});

export default stylesSlice.reducer;
