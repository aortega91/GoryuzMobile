import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import CookieManager from '@preeternal/react-native-cookie-manager';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { FALLBACK_COOKIE, ORIGIN } from '@api/client';
import useSubscriptionTheme from '@hooks/useSubscriptionTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBSCRIPTION_URL = ORIGIN;

// Runs at document start — seeds sessionStorage so the web app navigates
// directly to the subscription view (same mechanism zena uses post-login).
const INJECTED_JS_BEFORE_LOAD = `
  (function() {
    sessionStorage.setItem(
      'zena-view-storage',
      JSON.stringify({ state: { activeView: 'subscription' }, version: 0 })
    );
  })();
  true;
`;

// Runs after DOMContentLoaded — injects CSS to hide the web app's navigation.
//
// NOTE (brittle): Selectors target zena Layout.tsx by Tailwind class names:
//   - <header>  → top bar (gems, notifications, avatar)
//   - div[class*="w-64"][class*="bg-primary"]  → left sidebar
// If zena's markup or class names change, nav elements will reappear.
// Proper fix: Option B — have zena check `?embedded=1` and skip rendering
// the header/sidebar (one-line change in zena/src/components/Layout.tsx).
const INJECTED_JS_AFTER_LOAD = `
  (function() {
    var style = document.createElement('style');
    style.textContent = 'header, [class*="w-64"][class*="bg-primary"] { display: none !important; }';
    document.head.appendChild(style);
  })();
  true;
`;

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Parses the semicolon-separated FALLBACK_COOKIE string and sets each cookie
 * in the OS-level cookie store for the given origin, so the WebView includes
 * them in all requests (SSR + client-side XHR/fetch), not just the first.
 */
async function seedCookies(origin: string): Promise<void> {
  await CookieManager.clearAll();
  const entries = FALLBACK_COOKIE.split('; ').filter(e => e.includes('='));
  await Promise.all(
    entries.map(entry => {
      const eqIdx = entry.indexOf('=');
      const name = entry.slice(0, eqIdx);
      const value = entry.slice(eqIdx + 1);
      const isSecurePrefixed =
        name.startsWith('__Secure-') || name.startsWith('__Host-');
      return CookieManager.set(origin, {
        name,
        value,
        path: '/',
        secure: isSecurePrefixed,
        httpOnly: name !== 'goryuz-language',
      });
    }),
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function Subscription() {
  const theme = useSubscriptionTheme();
  const st = theme.subscription;
  const { t } = useTranslation();

  const webViewRef = useRef<WebView>(null);
  const [cookiesReady, setCookiesReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedCookies(SUBSCRIPTION_URL)
      .then(() => setCookiesReady(true))
      .catch(() => setCookiesReady(true)); // proceed even if seeding partially fails
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

  if (!cookiesReady) {
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
        source={{ uri: SUBSCRIPTION_URL }}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JS_BEFORE_LOAD}
        injectedJavaScript={INJECTED_JS_AFTER_LOAD}
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
