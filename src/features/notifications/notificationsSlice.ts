import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsState {
  items: AppNotification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<AppNotification, 'read'>>,
    ) => {
      if (state.items.some(n => n.id === action.payload.id)) return;
      state.items.unshift({ ...action.payload, read: false });
    },
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
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
