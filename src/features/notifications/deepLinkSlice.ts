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

/**
 * Pulls `friendId` out of a chat deep link (`/?view=messages&friendId=…`).
 * The same URL reaches us from two places — the `data.url` of an FCM push and
 * the `url` column of a notification-history row — so the parsing lives here.
 */
export function parseFriendId(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const query = url.split('?')[1] ?? '';
    return new URLSearchParams(query).get('friendId') ?? undefined;
  } catch {
    return undefined;
  }
}

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
