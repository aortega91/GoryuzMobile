/**
 * client.ts — Native fetch wrapper
 *
 * Provides a single `apiClient` with:
 *   - baseURL sourced from react-native-config (API_URL)
 *   - Automatic auth headers (Firebase ID token as `Authorization: Bearer`)
 *   - Automatic Crashlytics logging on every failed request
 *
 * Why native fetch instead of axios:
 *   axios suffered a supply-chain attack (March 2026, v1.14.1) and multiple
 *   CVEs in 2025-2026. fetch is built into React Native's JS engine and
 *   carries no third-party risk.
 */

import Config from 'react-native-config';
import auth from '@react-native-firebase/auth';
import { logApiError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import i18n from '@language/index';

// ─── Base URL ────────────────────────────────────────────────────────────────

const BASE_URL = (Config.API_URL ?? 'https://preview.goryuz.com/api').replace(
  /\/$/,
  '',
);

// Origin without the /api suffix — used to build absolute image URLs from relative paths.
// Exported for WebView-based screens that need to load the web app directly.
export const ORIGIN = BASE_URL.replace(/\/api$/, '');

// ─── Auth headers ─────────────────────────────────────────────────────────────
//
// The backend (zena) authenticates API requests with a Firebase ID token sent
// as `Authorization: Bearer <idToken>` on every /api/* route — it verifies the
// token with the Firebase Admin SDK (see zena/src/firebase/server.ts →
// getFirebaseSession). ID tokens are short-lived (~1h); the Firebase SDK serves
// a cached token until it nears expiry then refreshes transparently, and
// `onIdTokenChanged` fires on login, logout and every refresh.

// Latest ID token, cached synchronously so image helpers — which build an
// <Image> `source` prop and cannot await — can still attach the auth header.
let cachedIdToken: string | null = null;

// Image components subscribe here (via useSyncExternalStore in AuthedImage) so
// they re-render with a fresh Bearer header whenever the ID token changes
// (login / ~hourly refresh). A long-mounted <Image> would otherwise keep a
// stale token and 401 on a cache-miss re-fetch.
const tokenListeners = new Set<() => void>();
export function subscribeAuthToken(cb: () => void): () => void {
  tokenListeners.add(cb);
  return () => {
    tokenListeners.delete(cb);
  };
}
export function getAuthTokenSnapshot(): string | null {
  return cachedIdToken;
}
function notifyTokenListeners(): void {
  tokenListeners.forEach(cb => cb());
}

// Guards the one-shot "session expired" toast + sign-out, since
// resolveAuthHeaders can be hit by many concurrent requests on a dead token.
let sessionExpiredNotified = false;

auth().onIdTokenChanged(user => {
  if (!user) {
    cachedIdToken = null;
    notifyTokenListeners();
    return;
  }
  user
    .getIdToken()
    .then(token => {
      cachedIdToken = token;
      sessionExpiredNotified = false; // a valid token means we're healthy again
    })
    .catch(() => {
      cachedIdToken = null;
    })
    .finally(notifyTokenListeners);
});

/**
 * Resolve the Bearer auth header for an API request. Awaits the Firebase SDK,
 * which returns the cached token until it nears expiry, then refreshes it.
 * Pass `forceRefresh` to bypass the cache — used to recover from a 401.
 * Returns an empty object when no user is signed in.
 */
async function resolveAuthHeaders(
  forceRefresh = false,
): Promise<Record<string, string>> {
  const { currentUser } = auth();
  if (!currentUser) return {};
  try {
    const idToken = await currentUser.getIdToken(forceRefresh);
    cachedIdToken = idToken;
    return { Authorization: `Bearer ${idToken}` };
  } catch (err) {
    // A forced refresh (triggered by a 401) that still fails means the refresh
    // token itself is dead — the account was disabled/deleted, the password
    // changed, or the token was revoked. Notify the user once, then sign out so
    // the app-level onAuthStateChanged listener clears the session and bounces
    // to Login. A transient `auth/network-request-failed` is NOT terminal — we
    // leave the session intact and let the caller's error surface so a retry
    // can recover.
    if (forceRefresh && (err as { code?: string })?.code !== 'auth/network-request-failed') {
      if (!sessionExpiredNotified) {
        sessionExpiredNotified = true;
        toast.info(i18n.t('auth.sessionExpired'));
      }
      auth().signOut().catch(() => {});
    }
    return {};
  }
}

/** Synchronous Bearer header built from the cached token, for <Image> sources. */
function authHeadersSync(): Record<string, string> {
  return cachedIdToken ? { Authorization: `Bearer ${cachedIdToken}` } : {};
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core request function ────────────────────────────────────────────────────

/**
 * Make an authenticated request to the Goryuz API.
 * Automatically handles:
 *  - Authorization header (Firebase ID token or session-cookie fallback)
 *  - JSON parsing
 *  - Error normalisation + Crashlytics logging
 *
 * @param path    Relative path, e.g. "/profile" (leading slash optional)
 * @param options Standard fetch RequestInit options
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}${endpoint}`;

  const sendRequest = async (forceRefresh: boolean) => {
    const authHeaders = await resolveAuthHeaders(forceRefresh);
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
        ...(options.headers ?? {}),
      },
    }).catch((networkError: unknown) => {
      // Network-level failure (no response at all)
      logApiError(endpoint, networkError);
      throw new ApiError(
        0,
        endpoint,
        networkError instanceof Error
          ? networkError.message
          : 'Network request failed',
      );
    });
  };

  let response = await sendRequest(false);

  // A 401 typically means the ID token expired between requests. Force a
  // fresh token from Firebase and retry once before surfacing the error.
  if (response.status === 401) {
    response = await sendRequest(true);
  }

  if (!response.ok) {
    let responseBody = '<unreadable>';
    try {
      responseBody = await response.text();
    } catch { /* ignore */ }
    console.error(`[API] ${response.status} ${endpoint}`, { responseBody });
    const apiError = new ApiError(
      response.status,
      endpoint,
      `HTTP ${response.status} on ${endpoint}`,
    );
    logApiError(endpoint, apiError);
    throw apiError;
  }

  try {
    const data = (await response.json()) as T;
    return data;
  } catch (parseError) {
    logApiError(endpoint, parseError);
    throw new ApiError(response.status, endpoint, 'Failed to parse response');
  }
}

// ─── Image source helper ─────────────────────────────────────────────────────

/**
 * Builds the correct RN Image `source` prop for any imageData value stored in
 * the backend:
 *  - Base64 data URLs → returned as-is (no auth needed)
 *  - Relative paths (/api/images/...) → prefixed with ORIGIN + Bearer token
 *  - Absolute network URLs → passed through + Bearer token (private R2 proxy)
 */
export function getImageSource(
  imageData: string,
): { uri: string; headers?: Record<string, string> } {
  if (imageData.startsWith('data:')) {
    return { uri: imageData };
  }
  const uri = imageData.startsWith('/')
    ? `${ORIGIN}${imageData}`
    : imageData;
  return { uri, headers: authHeadersSync() };
}

// ─── Image → base64 helper ───────────────────────────────────────────────────

/**
 * Fetches an image (relative path, absolute URL, or existing data URL) and
 * returns it as a base64 data URL suitable for sending to AI endpoints.
 * Relative paths are prefixed with ORIGIN and sent with the Bearer token.
 */
export async function imageUrlToBase64(imageData: string): Promise<string> {
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  const uri = imageData.startsWith('/') ? `${ORIGIN}${imageData}` : imageData;
  const authHeaders = await resolveAuthHeaders();
  const response = await fetch(uri, { headers: authHeaders });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${uri} (${response.status})`);
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      let result = reader.result as string;
      // R2 storage often returns application/octet-stream regardless of the
      // actual image format. Gemini rejects that MIME type, so infer the real
      // type from the URL extension and patch the data URL prefix.
      if (result.startsWith('data:application/octet-stream')) {
        const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
        const mime =
          ext === 'png' ? 'image/png' :
          ext === 'gif' ? 'image/gif' :
          ext === 'webp' ? 'image/webp' :
          'image/jpeg'; // default — covers jpg, jpeg, and unknown
        result = result.replace('data:application/octet-stream', `data:${mime}`);
      }
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const apiGet = <T>(path: string) =>
  apiRequest<T>(path, { method: 'GET' });

export const apiPost = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiPatch = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const apiPut = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(path: string) =>
  apiRequest<T>(path, { method: 'DELETE' });
