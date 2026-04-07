import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootState } from '@utilities/store';
import { RootStackParamList } from './types';

// Screens
import Login from '@features/auth/screens/Login';
import Loading from '@features/auth/screens/Loading';
import Home from '@features/home/screens/Home';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.session.isAuthenticated,
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        <Stack.Screen name="Home" component={Home} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
