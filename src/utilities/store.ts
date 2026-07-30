import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type Storage,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import sessionReducer, { SessionState } from '@features/auth/sessionSlice';
import profileReducer from '@features/home/profileSlice';
import collectionReducer from '@features/collection/collectionSlice';
import scheduleReducer from '@features/schedule/scheduleSlice';
import stylesReducer from '@features/styles/stylesSlice';
import discoverReducer from '@features/discover/discoverSlice';
import notificationsReducer from '@features/notifications/notificationsSlice';
import deepLinkReducer from '@features/notifications/deepLinkSlice';
import appThemeReducer from './appThemeSlice';
import locationReducer from './locationSlice';

// ─── Keychain adapter (secure storage for sensitive session data) ─────────────

const KEYCHAIN_SERVICE = 'com.goryuz.session';

const keychainStorage: Storage = {
  setItem: async (_key, value) => {
    await Keychain.setGenericPassword('session', value, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  },
  getItem: async _key => {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    if (credentials) {
      return credentials.password;
    }
    return null;
  },
  removeItem: async _key => {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  },
};

// ─── Persist config ───────────────────────────────────────────────────────────

/** Session slice is stored in Keychain (iOS Keychain / Android Keystore) */
const sessionPersistConfig = {
  key: 'session',
  storage: keychainStorage,
  version: 1,
};

// Strip cityName before writing location to AsyncStorage — it is language-dependent
// and must be re-fetched each session. Coordinates persist for weather on cold start.
const locationTransform = createTransform(
  (state: { cityName: string | null; latitude: number | null; longitude: number | null }) =>
    ({ ...state, cityName: null }),
  inbound => inbound,
  { whitelist: ['location'] },
);

/** Root persist config uses AsyncStorage for any non-sensitive slices */
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  // session has its own persist config; profile/collection/schedule/styles/discover are always refetched on launch
  // notifications persists (not blacklisted) so users keep their notification history
  // deepLink is transient (consumed once by Home on the same launch that received it)
  blacklist: ['session', 'profile', 'collection', 'schedule', 'styles', 'discover', 'deepLink'],
  transforms: [locationTransform],
};

// ─── Root reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  session: persistReducer<SessionState>(sessionPersistConfig, sessionReducer),
  profile: profileReducer,
  collection: collectionReducer,
  schedule: scheduleReducer,
  styles: stylesReducer,
  discover: discoverReducer,
  notifications: notificationsReducer,
  deepLink: deepLinkReducer,
  appTheme: appThemeReducer,
  location: locationReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
