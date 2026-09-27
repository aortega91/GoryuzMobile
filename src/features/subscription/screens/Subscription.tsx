import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { ORIGIN } from '@api/client';
import { logError } from '@utilities/crashlytics';
import useSubscriptionTheme from '@hooks/useSubscriptionTheme';

// ─── Session transfer (Firebase → zena `__session` cookie) ────────────────────
//
// The WebView shows the real zena web app, which authenticates with an httpOnly
// `__session` cookie (not the Bearer header the REST client uses). zena mints
// that cookie in POST /api/firebase/session from a Firebase ID token
// (zena src/pages/api/firebase/session.ts → createSessionCookie).
//
// How it is done, and why (the previous version failed on some devices):
//
//  1. We load a tiny inline bootstrap document with `baseUrl: ORIGIN`, so it
//     runs *as* the zena origin. Its own inline <script> does the exchange —
//     no `injectedJavaScript`, whose timing differs per platform/WebView
//     version (iOS: document end; Android: onPageFinished; old Android System
//     WebViews: unreliable). Previously the script keyed off a `?mobileAuth=1`
//     query param on `/`, but zena's App.tsx strips every query string with
//     history.replaceState as soon as React mounts (deep-link cleanup) — so
//     whether the exchange ran at all depended on whether the injected script
//     beat React's mount. On fast devices/cached bundles it lost, and the user
//     was left on the logged-out landing page.
//  2. The exchange's HTTP status is checked. Before, a 401 (e.g. an expired ID
//     token) still redirected to `/`, again landing logged out. Now a failure
//     is reported back over postMessage, retried once with a fresh token, then
//     surfaced as an error + Crashlytics.
//  3. The ID token is force-refreshed right before the exchange. The SDK's
//     cached token is judged against the device clock; on devices with a
//     skewed clock (or right after resuming from background) it can hand out
//     a token the server already considers expired → 401.
//  4. The cookie is set by a same-origin fetch inside the WebView itself, so it
//     lands directly in the WebView's own cookie store — no dependency on
//     `sharedCookiesEnabled` syncing NSHTTPCookieStorage → WKHTTPCookieStore
//     (iOS), which also used to copy stale `__session` cookies in.

const EXCHANGE_TIMEOUT_MS = 20000;

/** zena `cancelSubscriptionAction` in es / en / pt — hidden in the app. */
const CANCEL_LABELS = ['Cancelar Suscripción', 'Cancel Subscription', 'Cancelar Assinatura'];

function buildBootstrapHtml(idToken: string): string {
  // JSON.stringify quotes/escapes the token; `<` is escaped so it can never
  // close the <script> tag.
  const token = JSON.stringify(idToken).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body><script>
(function () {
  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  fetch('/api/firebase/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken: ${token} })
  }).then(function (res) {
    if (!res.ok) { post({ type: 'session-error', status: res.status }); return; }
    try {
      // Open the web app straight on the subscription view (zena routes
      // "subscription" to Profile > Subscription).
      sessionStorage.setItem('goryuz-view-storage',
        JSON.stringify({ state: { activeView: 'subscription' }, version: 0 }));
      // The native Profile already showed its own sub-module coach mark; don't
      // let the web one block the WebView (it only closes with a button).
      var key = 'goryuz-submodules-tip-seen';
      var seen = JSON.parse(localStorage.getItem(key) || '[]');
      if (seen.indexOf('profile') === -1) { seen.push('profile'); localStorage.setItem(key, JSON.stringify(seen)); }
    } catch (e) {}
    post({ type: 'session-ready' });
    window.location.replace('/');
  }).catch(function (err) {
    post({ type: 'session-error', status: 0, message: String(err && err.message || err) });
  });
})();
</script></body></html>`;
}

/**
 * Runs on every page of the web app. Hides the web chrome the native app
 * already provides, and the "cancel subscription" action (client requirement:
 * the app only shows the subscription detail).
 *
 * NOTE (brittle): `header` / the sidebar are matched by zena Layout.tsx
 * Tailwind classes and the cancel button by its visible label. If zena's
 * markup or copy changes, they may reappear. `[data-submodules-nav]` is a
 * stable data attribute.
 */
const CHROME_JS = `
(function () {
  if (window.__goryuzChrome) return;
  window.__goryuzChrome = true;
  var css = 'header, [class*="w-64"][class*="bg-primary"], [data-submodules-nav] { display: none !important; }';
  function addStyle() {
    var root = document.head || document.documentElement;
    if (!root) return false;
    var style = document.createElement('style');
    style.textContent = css;
    root.appendChild(style);
    return true;
  }
  if (!addStyle()) document.addEventListener('DOMContentLoaded', addStyle);
  var labels = ${JSON.stringify(CANCEL_LABELS)};
  function hideCancel() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var text = (buttons[i].textContent || '').trim();
      if (labels.indexOf(text) !== -1) buttons[i].style.display = 'none';
    }
  }
  function observe() {
    hideCancel();
    new MutationObserver(hideCancel).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe);
  else observe();
})();
true;
`;

type Phase = 'token' | 'ready' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

function Subscription() {
  const theme = useSubscriptionTheme();
  const st = theme.subscription;
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>('token');
  const [errorKey, setErrorKey] = useState('subscription.loadError');
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Remounts the WebView (fresh bootstrap) on retry.
  const [attemptKey, setAttemptKey] = useState(0);

  const retriedRef = useRef(false);
  const sessionReadyRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExchangeTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const fail = useCallback(
    (error: unknown, context: string, messageKey = 'subscription.loadError') => {
      clearExchangeTimeout();
      logError(error, context);
      setErrorKey(messageKey);
      setPhase('error');
    },
    [],
  );

  /** Gets a force-refreshed ID token and (re)starts the bootstrap. */
  const startExchange = useCallback(async () => {
    clearExchangeTimeout();
    sessionReadyRef.current = false;
    setLoading(true);
    setPhase('token');

    const { currentUser } = auth();
    if (!currentUser) {
      // Not signed in natively — nothing to transfer; show the public site.
      sessionReadyRef.current = true;
      setIdToken(null);
      setPhase('ready');
      return;
    }
    try {
      const token = await currentUser.getIdToken(true);
      setIdToken(token);
      setAttemptKey(k => k + 1);
      setPhase('ready');
      timeoutRef.current = setTimeout(() => {
        if (!sessionReadyRef.current) {
          fail(
            new Error('Session exchange timed out'),
            'Subscription:sessionTimeout',
            'subscription.sessionError',
          );
        }
      }, EXCHANGE_TIMEOUT_MS);
    } catch (err) {
      fail(err, 'Subscription:getIdToken');
    }
  }, [fail]);

  useEffect(() => {
    startExchange();
    return clearExchangeTimeout;
  }, [startExchange]);

  const handleRetry = useCallback(() => {
    retriedRef.current = false;
    startExchange();
  }, [startExchange]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let msg: { type?: string; status?: number; message?: string };
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return; // not ours
      }
      if (msg.type === 'session-ready') {
        clearExchangeTimeout();
        sessionReadyRef.current = true;
        return;
      }
      if (msg.type === 'session-error') {
        // One silent retry with a brand-new token covers a token that expired
        // in flight; a second failure is real.
        if (!retriedRef.current) {
          retriedRef.current = true;
          startExchange();
          return;
        }
        fail(
          new Error(`Session exchange failed: HTTP ${msg.status ?? '?'} ${msg.message ?? ''}`.trim()),
          'Subscription:sessionExchange',
          'subscription.sessionError',
        );
      }
    },
    [fail, startExchange],
  );

  const handleLoadEnd = useCallback(() => {
    // The bootstrap document also fires loadEnd — keep the loader up until the
    // real web app (loaded after the exchange) has finished.
    if (sessionReadyRef.current) setLoading(false);
  }, []);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      // Keep loading indicator in sync when the web app performs internal
      // client-side navigation (history.pushState etc.)
      if (!navState.loading && sessionReadyRef.current) setLoading(false);
    },
    [],
  );

  const handleError = useCallback(() => {
    fail(new Error('WebView failed to load'), 'Subscription:webviewLoad');
  }, [fail]);

  if (phase === 'error') {
    return (
      <View style={[styles.centered, { backgroundColor: st.background }]}>
        <Text style={[styles.errorText, { color: st.errorText }]}>
          {t(errorKey)}
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

  if (phase === 'token') {
    return (
      <View style={[styles.centered, { backgroundColor: st.background }]}>
        <ActivityIndicator size="large" color={st.loaderColor} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: st.background }]}>
      <WebView
        key={attemptKey}
        source={
          idToken
            ? { html: buildBootstrapHtml(idToken), baseUrl: `${ORIGIN}/` }
            : { uri: ORIGIN }
        }
        injectedJavaScriptBeforeContentLoaded={CHROME_JS}
        injectedJavaScript={CHROME_JS}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        originWhitelist={['*']}
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
