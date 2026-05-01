import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
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
import appThemeReducer from './appThemeSlice';

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

/** Root persist config uses AsyncStorage for any non-sensitive slices */
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  // session has its own persist config; profile/collection are always refetched on launch
  blacklist: ['session', 'profile', 'collection'],
};

// ─── Root reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  session: persistReducer<SessionState>(sessionPersistConfig, sessionReducer),
  profile: profileReducer,
  collection: collectionReducer,
  appTheme: appThemeReducer,
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
