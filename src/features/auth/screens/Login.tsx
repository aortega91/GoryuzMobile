import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import useTheme from '@hooks/useTheme';
import GoryuzLogo from '@assets/GoryuzLogo';
import { setSession } from '@features/auth/sessionSlice';
import { AppDispatch } from '@utilities/store';

// Configure Google Sign-In once (Web Client ID comes from google-services.json /
// GoogleService-Info.plist; set it in the Firebase Console).
GoogleSignin.configure({
  webClientId: '718649973201-60v4sucjanl44grg77r9psqgjo2in5b4.apps.googleusercontent.com',
  offlineAccess: true,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorKey(error: any): string {
  if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    return 'auth.loginErrorCancelled';
  }
  if (
    error.code === statusCodes.IN_PROGRESS ||
    error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
  ) {
    return 'auth.loginErrorGeneric';
  }
  if (
    error.message?.includes('network') ||
    error.code === 'auth/network-request-failed'
  ) {
    return 'auth.loginErrorNetwork';
  }
  if (error.code === 'auth/account-exists-with-different-credential') {
    return 'auth.loginErrorAccountExists';
  }
  return 'auth.loginErrorGeneric';
}

// ─── Component ────────────────────────────────────────────────────────────────

function Login() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorKey(null);
    setIsLoading(true);
    try {
      // Check Play Services availability (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Open the Google account picker
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      // Create a Firebase credential with the Google ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the credential
      const { user } = await auth().signInWithCredential(googleCredential);

      dispatch(
        setSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      );
    } catch (error: any) {
      setErrorKey(getErrorKey(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.auth.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.auth.background}
      />


      {/* ── Logo + App name ── */}
      <View style={styles.logoSection}>
        <GoryuzLogo size={80} color={theme.auth.logoColor} />
        <Text style={[styles.appName, { color: theme.auth.headlineText }]}>
          GORYUZ
        </Text>
      </View>

      {/* ── Headline copy ── */}
      <View style={styles.headlineSection}>
        <Text style={[styles.headline, { color: theme.auth.headlineText }]}>
          {t('auth.loginTitle')}
        </Text>

        <Text style={[styles.subCopy, { color: theme.auth.bodyText }]}>
          {t('auth.loginSubtitle')}{' '}
          <Text style={[styles.accentText, { color: theme.auth.accentText }]}>
            {t('auth.loginSubtitleAccent')}
          </Text>
          {'\n'}
          {t('auth.loginSubtitleSuffix')}
        </Text>
      </View>

      {/* ── Inline error ── */}
      {errorKey ? (
        <Text style={[styles.errorText, { color: theme.auth.errorText }]}>
          {t(errorKey)}
        </Text>
      ) : null}

      {/* ── Google sign-in button ── */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[
            styles.googleButton,
            {
              backgroundColor: theme.auth.googleButtonBg,
              borderColor: theme.auth.googleButtonBorder,
            },
            isLoading && styles.googleButtonDisabled,
          ]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.auth.googleButtonText} />
          ) : (
            <>
              <Text style={styles.googleG}>G</Text>
              <Text
                style={[
                  styles.googleButtonLabel,
                  { color: theme.auth.googleButtonText },
                ]}
              >
                {t('auth.loginButton')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 48,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headlineSection: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
    marginBottom: 20,
  },
  subCopy: {
    fontSize: 17,
    lineHeight: 26,
  },
  accentText: {
    fontStyle: 'italic',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  ctaSection: {
    paddingTop: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    gap: 10,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;
