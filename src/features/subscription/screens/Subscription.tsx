import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { ORIGIN } from '@api/client';
import { logError } from '@utilities/crashlytics';
import useSubscriptionTheme from '@hooks/useSubscriptionTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

// We first load /login (an unauthenticated route excluded from the API guard),
// establish a Firebase session cookie there, then redirect to the subscription
// view. /login renders no chrome we need to hide, so the flash is masked by the
// loader overlay.
const LOGIN_URL = `${ORIGIN}/login`;

/**
 * Builds the script injected after each page load. On /login it exchanges the
 * Firebase ID token for a `__session` cookie via POST /api/firebase/session
 * (zena verifies the token with the Admin SDK and Set-Cookies the session),
 * seeds sessionStorage so the web app opens straight on the subscription view,
 * then navigates to /. On every other page it hides the web app's nav chrome.
 *
 * NOTE (brittle): the CSS selectors target zena Layout.tsx by Tailwind class
 * names (<header> = top bar, div[class*="w-64"][class*="bg-primary"] = sidebar).
 * If zena's markup changes, nav elements will reappear.
 */
function buildInjectedJs(idToken: string): string {
  return `
  (function() {
    if (location.pathname === '/login') {
      fetch('/api/firebase/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: '${idToken}' }),
        credentials: 'include'
      }).then(function() {
        sessionStorage.setItem(
          'zena-view-storage',
          JSON.stringify({ state: { activeView: 'subscription' }, version: 0 })
        );
        window.location.replace('/');
      }).catch(function() { window.location.replace('/'); });
    } else {
      var style = document.createElement('style');
      style.textContent = 'header, [class*="w-64"][class*="bg-primary"] { display: none !important; }';
      document.head.appendChild(style);
    }
  })();
  true;
`;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Subscription() {
  const theme = useSubscriptionTheme();
  const st = theme.subscription;
  const { t } = useTranslation();

  const webViewRef = useRef<WebView>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { currentUser } = auth();
    if (!currentUser) {
      setTokenReady(true);
      return;
    }
    currentUser
      .getIdToken()
      .then(token => setIdToken(token))
      .catch(err => logError(err, 'Subscription:getIdToken'))
      .finally(() => setTokenReady(true));
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      // Keep loading indicator in sync when the web app performs internal
      // client-side navigation (history.pushState etc.)
      if (!navState.loading) setLoading(false);
    },
    [],
  );

  if (!tokenReady) {
    return (
      <View style={[styles.centered, { backgroundColor: st.background }]}>
        <ActivityIndicator size="large" color={st.loaderColor} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.centered, { backgroundColor: st.background }]}>
        <Text style={[styles.errorText, { color: st.errorText }]}>
          {t('subscription.loadError')}
        </Text>
        <Touchable
          style={[styles.retryButton, { backgroundColor: st.retryButtonBg }]}
          borderRadius={10}
          onPress={handleRetry}
        >
          <Text style={[styles.retryText, { color: st.retryButtonText }]}>
            {t('subscription.retry')}
          </Text>
        </Touchable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: st.background }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: idToken ? LOGIN_URL : ORIGIN }}
        injectedJavaScript={idToken ? buildInjectedJs(idToken) : undefined}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoadError(true)}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        style={styles.webView}
      />
      {loading && (
        <View style={[styles.loaderOverlay, { backgroundColor: st.background }]}>
          <ActivityIndicator size="large" color={st.loaderColor} />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Subscription;
