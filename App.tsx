import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from '@utilities/store';
import RootNavigator from '@navigation/RootNavigator';
import Loading from '@features/auth/screens/Loading';

// Initialise i18n before the first render
import '@language/index';

function App() {
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
