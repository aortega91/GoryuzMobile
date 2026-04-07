import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import auth from '@react-native-firebase/auth';

import useTheme from '@hooks/useTheme';
import GoryuzLogo from '@assets/GoryuzLogo';
import { clearSession } from '@features/auth/sessionSlice';
import { RootState, AppDispatch } from '@utilities/store';

function Home() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.session.user);

  const handleSignOut = async () => {
    await auth().signOut();
    dispatch(clearSession());
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.auth.background }]}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.auth.background}
      />


      {/* Logo */}
      <GoryuzLogo size={64} color={theme.auth.logoColor} />

      {/* Avatar */}
      {user?.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : null}

      {/* Welcome */}
      <Text style={[styles.welcome, { color: theme.auth.headlineText }]}>
        {t('home.welcome')}
      </Text>
      {user?.displayName ? (
        <Text style={[styles.name, { color: theme.auth.accentText }]}>
          {user.displayName}
        </Text>
      ) : null}
      <Text style={[styles.message, { color: theme.auth.bodyText }]}>
        {t('home.welcomeMessage')}
      </Text>

      {/* Sign out */}
      <TouchableOpacity
        style={[
          styles.signOutButton,
          {
            backgroundColor: theme.auth.googleButtonBg,
            borderColor: theme.auth.googleButtonBorder,
          },
        ]}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.signOutLabel,
            { color: theme.auth.googleButtonText },
          ]}
        >
          {t('home.signOut')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  welcome: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  signOutButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Home;
