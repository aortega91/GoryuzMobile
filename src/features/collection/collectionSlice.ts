import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { logError } from '@utilities/crashlytics';
import { clearSession } from '@features/auth/sessionSlice';
import {
  fetchCollection,
  addCollectionItems,
  updateCollectionItem,
  removeCollectionItem,
} from './api/collectionApi';
import { ClothingItem, ScannedItem } from './types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface CollectionState {
  items: ClothingItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CollectionState = {
  items: [],
  status: 'idle',
  error: null,
};

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const loadCollection = createAsyncThunk(
  'collection/load',
  async () => fetchCollection(),
);

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8;
    return v.toString(16);
  });
}

export const addItems = createAsyncThunk(
  'collection/addItems',
  async (scannedItems: ScannedItem[]) => {
    const items: ClothingItem[] = scannedItems.map(item => ({
      ...item,
      id: generateId(),
    }));
    return addCollectionItems(items);
  },
);

export const renameItem = createAsyncThunk(
  'collection/rename',
  async ({ id, name }: { id: string; name: string }) => {
    await updateCollectionItem(id, name);
    return { id, name };
  },
);

export const deleteItem = createAsyncThunk(
  'collection/delete',
  async (id: string) => {
    await removeCollectionItem(id);
    return id;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    resetCollection(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    // loadCollection
    builder
      .addCase(loadCollection.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCollection.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadCollection.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load collection';
        logError(new Error(state.error), 'loadCollection');
      });

    // addItems
    builder
      .addCase(addItems.fulfilled, (state, action) => {
        console.log('[collectionSlice] addItems.fulfilled payload:', action.payload);
        state.items.unshift(...action.payload);
      })
      .addCase(addItems.rejected, (_state, action) => {
        console.error('[collectionSlice] addItems.rejected:', action.error);
        logError(
          new Error(action.error.message ?? 'Failed to add items'),
          'addItems',
        );
      });

    // renameItem
    builder
      .addCase(renameItem.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.id);
        if (item) {
          item.name = action.payload.name;
        }
      })
      .addCase(renameItem.rejected, (_state, action) => {
        logError(
          new Error(action.error.message ?? 'Failed to rename item'),
          'renameItem',
        );
      });

    // deleteItem
    builder
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deleteItem.rejected, (_state, action) => {
        logError(
          new Error(action.error.message ?? 'Failed to delete item'),
          'deleteItem',
        );
      });

    // Clear collection when user signs out
    builder.addCase(clearSession, state => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    });
  },
});

export const { resetCollection } = collectionSlice.actions;
export default collectionSlice.reducer;
