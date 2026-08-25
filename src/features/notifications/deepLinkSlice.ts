import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PendingDeepLink } from './deepLink';

export interface DeepLinkState {
  /**
   * Screen a tapped notification wants opened, parked here until Home can act
   * on it — the tap often lands before Home is mounted (killed app) or from
   * outside React entirely (the FCM handler in utilities/push.ts).
   */
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
