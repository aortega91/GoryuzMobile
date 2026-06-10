import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

import { store, persistor } from '@utilities/store';
import { setSession, clearSession } from '@features/auth/sessionSlice';
import RootNavigator from '@navigation/RootNavigator';
import Loading from '@features/auth/screens/Loading';
import Toast from '@components/Toast';

// Initialise i18n before the first render
import '@language/index';

function App() {
  useEffect(() => {
    // Firebase is the single source of truth for the session. This listener
    // mirrors its auth state into Redux (which drives navigation), so:
    //  - on cold start it restores or clears the session to match Firebase,
    //  - on logout, a single auth().signOut() bounces the app to Login,
    //  - when a token can no longer be refreshed (revoked/disabled account),
    //    client.ts signs out and this listener returns the user to Login.
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        store.dispatch(
          setSession({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }),
        );
      } else {
        store.dispatch(clearSession());
      }
    });
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
    <Provider store={store}>
      {/*
       * PersistGate delays rendering until redux-persist has rehydrated
       * the store from storage. Loading screen is shown during this phase.
       */}
      <PersistGate loading={<Loading />} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar translucent backgroundColor="transparent" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          {/* Mounted at the root (not inside a screen) so toasts survive
              navigation — e.g. the session-expired toast shown as the app
              transitions from Home to Login. */}
          <Toast />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
