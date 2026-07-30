import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DeepLinkKind = 'gems' | 'chat_message';

export interface PendingDeepLink {
  kind: DeepLinkKind;
  friendId?: string;
  friendName?: string;
}

export interface DeepLinkState {
  pendingDeepLink: PendingDeepLink | null;
}

const initialState: DeepLinkState = {
  pendingDeepLink: null,
};

const deepLinkSlice = createSlice({
  name: 'deepLink',
  initialState,
  reducers: {
    setPendingDeepLink(state, action: PayloadAction<PendingDeepLink>) {
      state.pendingDeepLink = action.payload;
    },
    clearPendingDeepLink(state) {
      state.pendingDeepLink = null;
    },
  },
});

export const { setPendingDeepLink, clearPendingDeepLink } = deepLinkSlice.actions;
export default deepLinkSlice.reducer;
