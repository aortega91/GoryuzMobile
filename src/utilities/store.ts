import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
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
import { createMMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

import sessionReducer, { SessionState } from '@features/auth/sessionSlice';

// ─── MMKV instance (general-purpose fast storage) ────────────────────────────

const mmkv = createMMKV({ id: 'goryuz-store' });

const mmkvStorage: Storage = {
  setItem: (key, value) => {
    mmkv.set(key, value);
    return Promise.resolve(true);
  },
  getItem: key => {
    const value = mmkv.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: key => {
    mmkv.remove(key);
    return Promise.resolve();
  },
};

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

/** Root persist config uses MMKV for any non-sensitive slices added in future */
const rootPersistConfig = {
  key: 'root',
  storage: mmkvStorage,
  version: 1,
  blacklist: ['session'], // session has its own persist config above
};

// ─── Root reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  session: persistReducer<SessionState>(sessionPersistConfig, sessionReducer),
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
