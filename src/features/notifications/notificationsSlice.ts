import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { clearSession } from '@features/auth/sessionSlice';
import { toIsoTimestamp } from '@utilities/date';
import {
  deleteNotifications,
  fetchNotifications,
  markNotificationsRead,
  type NotificationKind,
  type ServerNotification,
} from './api/notificationsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Where a notification came from, which decides where a read/delete goes:
 *
 *  - `server` — push history written by the notifications worker. Capped at 20
 *    per user, survives reinstalls and is shared with the web bell, so acting
 *    on one has to reach `/notifications`.
 *  - `local` — in-app notice this device raised on its own (e.g. "you have an
 *    outfit planned for today"). There is no server row to update.
 */
export type NotificationSource = 'server' | 'local';

export interface AppNotification {
  id: string;
  /** Headline — server history only; local notices carry just `text`. */
  title?: string;
  text: string;
  /** ISO-8601, normalised on load — see `toIsoTimestamp`. */
  timestamp: string;
  read: boolean;
  source: NotificationSource;
  /** Web deep link carried by the push, e.g. `/?view=messages&friendId=…`. */
  url?: string;
  kind?: NotificationKind;
}

interface NotificationsState {
  items: AppNotification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * The slice of root state the thunks below read. Declared here rather than
 * imported as `RootState` so this module stays off the store's import cycle;
 * `getState()` is cast to it instead of being declared through the thunk's
 * `state` generic, which would narrow `dispatch` past what `AppDispatch` is.
 */
interface StateWithNotifications {
  notifications: NotificationsState;
}

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
  error: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fromServer(n: ServerNotification): AppNotification {
  return {
    id: n.id,
    title: n.title,
    text: n.body,
    timestamp: toIsoTimestamp(n.createdAt),
    read: n.read,
    source: 'server',
    url: n.url ?? undefined,
    kind: n.kind,
  };
}

function byNewestFirst(a: AppNotification, b: AppNotification): number {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

// ─── Load thunk ───────────────────────────────────────────────────────────────

/**
 * Pulls the server history and merges it with whatever local notices this
 * device raised. Cheap and idempotent — safe to call on mount, on pull to
 * refresh, and whenever a push arrives in the foreground.
 */
export const loadNotifications = createAsyncThunk(
  'notifications/load',
  () => fetchNotifications(),
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Raises a local, device-only notice. Server history rows never come
     * through here — they arrive via `loadNotifications`.
     */
    addNotification: (
      state,
      action: PayloadAction<Omit<AppNotification, 'read' | 'source'>>,
    ) => {
      if (state.items.some(n => n.id === action.payload.id)) return;
      state.items.unshift({ ...action.payload, read: false, source: 'local' });
    },
    // The three below are the optimistic half of the thunks further down.
    // Screens should dispatch the thunks instead, so that acting on a
    // server-backed notification also persists.
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find(n => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllAsRead: state => {
      state.items = state.items.map(n => ({ ...n, read: true }));
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadNotifications.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        // The server list is authoritative for its own rows: replace them
        // wholesale (that is how a read or delete done on the web shows up
        // here, and how pruned-away rows disappear) and keep the local notices.
        const local = state.items.filter(n => n.source === 'local');
        state.items = [...action.payload.map(fromServer), ...local].sort(byNewestFirst);
        state.status = 'succeeded';
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        // Keep whatever is already on screen — a failed refresh should not
        // empty the bell, the persisted history is still the best we have.
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load notifications';
      })
      // The history belongs to the account that was signed in. It is persisted,
      // so without this the next user to log in here would inherit it.
      .addCase(clearSession, () => initialState);
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = notificationsSlice.actions;

// ─── Mutating thunks ──────────────────────────────────────────────────────────
//
// Each updates Redux first so the UI reacts immediately, then persists to the
// server when the notification came from there. If that call fails the
// optimistic edit is undone by re-reading the server list, so the bell never
// settles on a state the backend disagrees with.

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { dispatch, getState }) => {
    const state = getState() as StateWithNotifications;
    const item = state.notifications.items.find(n => n.id === id);
    if (!item || item.read) return;

    dispatch(markAsRead(id));
    if (item.source !== 'server') return;

    try {
      await markNotificationsRead({ id });
    } catch (err) {
      dispatch(loadNotifications());
      throw err;
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_: void, { dispatch, getState }) => {
    const state = getState() as StateWithNotifications;
    const hasServerUnread = state.notifications.items.some(
      n => n.source === 'server' && !n.read,
    );

    dispatch(markAllAsRead());
    if (!hasServerUnread) return;

    try {
      await markNotificationsRead({ all: true });
    } catch (err) {
      dispatch(loadNotifications());
      throw err;
    }
  },
);

export const removeNotification = createAsyncThunk(
  'notifications/remove',
  async (id: string, { dispatch, getState }) => {
    const state = getState() as StateWithNotifications;
    const item = state.notifications.items.find(n => n.id === id);
    if (!item) return;

    dispatch(deleteNotification(id));
    if (item.source !== 'server') return;

    try {
      await deleteNotifications({ id });
    } catch (err) {
      dispatch(loadNotifications());
      throw err;
    }
  },
);

export default notificationsSlice.reducer;
