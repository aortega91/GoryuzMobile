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
import {
  SparklesIcon,
  UsersIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
} from '@assets/icons';
import { setSession } from '@features/auth/sessionSlice';
import { AppDispatch } from '@utilities/store';
import { AuthTheme } from '@features/auth/theme';
import BlobBackground from '../components/BlobBackground';

GoogleSignin.configure({
  webClientId:
    '718649973201-60v4sucjanl44grg77r9psqgjo2in5b4.apps.googleusercontent.com',
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

// ─── Feature pillars ──────────────────────────────────────────────────────────

type PillarIcon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const PILLARS: { Icon: PillarIcon; labelKey: string }[] = [
  { Icon: SparklesIcon, labelKey: 'auth.loginPillar1' },
  { Icon: UsersIcon, labelKey: 'auth.loginPillar2' },
  { Icon: RefreshCwIcon, labelKey: 'auth.loginPillar3' },
  { Icon: ShoppingBagIcon, labelKey: 'auth.loginPillar4' },
];

// ─── Component ────────────────────────────────────────────────────────────────

function Login() {
  const theme = useTheme() as AuthTheme;
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorKey(null);
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
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

      <BlobBackground />

      {/* ── Content ── */}
      <View style={styles.content}>

        {/* Header: logo card + brand + tagline */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.logoCard,
              { backgroundColor: theme.auth.logoCardBg },
            ]}
          >
            <GoryuzLogo size={64} color={theme.auth.logoColor} />
          </View>
          <Text style={[styles.brandName, { color: theme.auth.headlineText }]}>
            GORYUZ
          </Text>
          <Text style={[styles.tagline, { color: theme.auth.bodyText }]}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        {/* Center: button + pillars */}
        <View style={styles.centerSection}>
          {errorKey ? (
            <Text style={[styles.errorText, { color: theme.auth.errorText }]}>
              {t(errorKey)}
            </Text>
          ) : null}

          {/* Google sign-in button */}
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
              <ActivityIndicator
                size="small"
                color={theme.auth.googleButtonText}
              />
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

          {/* Feature pillar grid */}
          <View style={styles.pillarsRow}>
            {PILLARS.slice(0, 2).map(({ Icon, labelKey }) => (
              <View
                key={labelKey}
                style={[
                  styles.pillarCard,
                  {
                    backgroundColor: theme.auth.pillarCardBg,
                    borderColor: theme.auth.pillarCardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pillarIconWrap,
                    { backgroundColor: theme.auth.pillarIconBg },
                  ]}
                >
                  <Icon size={22} color={theme.auth.pillarIconColor} strokeWidth={2.5} />
                </View>
                <Text
                  style={[styles.pillarLabel, { color: theme.auth.pillarText }]}
                  numberOfLines={2}
                >
                  {t(labelKey)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.pillarsRow, styles.pillarsRowGap]}>
            {PILLARS.slice(2, 4).map(({ Icon, labelKey }) => (
              <View
                key={labelKey}
                style={[
                  styles.pillarCard,
                  {
                    backgroundColor: theme.auth.pillarCardBg,
                    borderColor: theme.auth.pillarCardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pillarIconWrap,
                    { backgroundColor: theme.auth.pillarIconBg },
                  ]}
                >
                  <Icon size={22} color={theme.auth.pillarIconColor} strokeWidth={2.5} />
                </View>
                <Text
                  style={[styles.pillarLabel, { color: theme.auth.pillarText }]}
                  numberOfLines={2}
                >
                  {t(labelKey)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Main layout
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: Platform.OS === 'ios' ? 60 : 48,
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
    // Shadow
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Center section
  centerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  // Google button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    fontWeight: '700',
  },
  // Pillars grid
  pillarsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillarsRowGap: {
    marginTop: 12,
  },
  pillarCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pillarIconWrap: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  pillarLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default Login;