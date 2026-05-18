/**
 * client.ts — Native fetch wrapper
 *
 * Provides a single `apiClient` with:
 *   - baseURL sourced from react-native-config (API_URL)
 *   - Automatic auth headers (Firebase Bearer token, or fallback cookie)
 *   - Automatic Crashlytics logging on every failed request
 *
 * Why native fetch instead of axios:
 *   axios suffered a supply-chain attack (March 2026, v1.14.1) and multiple
 *   CVEs in 2025-2026. fetch is built into React Native's JS engine and
 *   carries no third-party risk.
 */

import Config from 'react-native-config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in dormant Firebase auth block; restore when backend is ready
import auth from '@react-native-firebase/auth';
import { logApiError } from '@utilities/crashlytics';

// ─── Base URL ────────────────────────────────────────────────────────────────

const BASE_URL = (Config.API_URL ?? 'https://preview.goryuz.com/api').replace(
  /\/$/,
  '',
);

// Origin without the /api suffix — used to build absolute image URLs from relative paths
const ORIGIN = BASE_URL.replace(/\/api$/, '');

// ─── Fallback token (from zena/Untitled-1.json — used while backend auth is
//     being aligned with Firebase ID tokens) ──────────────────────────────────

// Full cookie string copied from browser DevTools (preview.goryuz.com)
// Replace this whenever the session expires.
const FALLBACK_COOKIE =
  '__Host-authjs.csrf-token=11e92702d1951daf8e22bcc48d3a24da47a54d505967efd62d34be6a5622aa6b%7Cdb17ab489780169cb0551bf700949a02b0c02ed881335f7f3994f58c031356cc; __Secure-authjs.callback-url=https%3A%2F%2Fpreview.goryuz.com%2F; goryuz-language=es; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiM0U1NTNVWW15MU45MmNqdHoyWHV1WWZPMGcyUVI0bF9sdGVIckZqX1hPS2lHN29DcEVNaWZrQ1Y4aDItRDk4djZFN2pCNi1haF92YXJSOFktR0l4OGcifQ..1Mh5XBKX-F0jUQxS-nz3lA.YpuOE1L1b1rUttpcaw2GL1-CG1eInIea3Pm6gapmg8rDpcJkz-LpORJ7T0OI98ge5TYeZ6aZ3wriMsy67kWju6qTYVknELWMnCJYwSJbWEq6LGxO_nvOLnxzJ8XufD7vGtRpOrtzKBwBFIUCWs-1hW5j_NeYrB7Gd9ZAUsnHki-9bCCsD9kc_D0NuwlLmqLVXEysCoaTxvjbG-uQfkAMZ5igmEYUUDL8ufNg8HluTMpQuuqOM7fcnv9ubMwTGrcDU4AQWmmeAH5h73x6Xf4S6QNUvMpAH3hOSzwLIFU05BF1TnGdlowRLEim0wJsNtCe8FswuU0CXDcNhpQasJ7lQ9hNSlUsrcll9Mml9LywfdKZP8MfKZYa8dkRL7-9L8LkreTyYi2ISoIitV9Uqoro3IEFqzCtndZyT4QTZgI9iOX8Uyeh2RAC4zOvY-ewjBni8wKnBKLkJMifZV-xWK_UGA.q2HyDkjbSDBkiPLZUQK_oeweMzboiKNl1v1u4DuAzpQ';

// ─── Auth headers ─────────────────────────────────────────────────────────────

/**
 * Resolve the appropriate auth headers for the current session.
 *
 * CURRENT BEHAVIOUR: always returns the hardcoded fallback cookie.
 * The backend (Auth.js / iron-session) does not yet accept Firebase ID tokens.
 *
 * TO ENABLE FIREBASE AUTH (once backend implements /api/auth/firebase):
 *   1. Delete the early-return line and FALLBACK_COOKIE constant above.
 *   2. Uncomment the Firebase block below.
 *   3. Make the function async again.
 */
function resolveAuthHeaders(): { Cookie: string } | { Authorization: string } {
  // --- TEMPORARY: remove this return when backend is ready ---
  return { Cookie: FALLBACK_COOKIE };

  // --- Restore when backend accepts Firebase ID tokens ---
  // const { currentUser } = auth();
  // if (currentUser) {
  //   const idToken = await currentUser.getIdToken(false);
  //   if (idToken) return { Authorization: `Bearer ${idToken}` };
  // }
  // return { Cookie: FALLBACK_COOKIE };
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

  const authHeaders = resolveAuthHeaders();

  const response = await fetch(url, {
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
 *  - Relative paths (/api/images/...) → prefixed with ORIGIN + session cookie
 *  - Absolute network URLs → passed through + session cookie (private R2 proxy)
 */
export function getImageSource(
  imageData: string,
): { uri: string; headers?: Record<string, string> } {
  if (imageData.startsWith('data:')) {
    return { uri: imageData };
  }
  const authHeaders = resolveAuthHeaders() as Record<string, string>;
  const uri = imageData.startsWith('/')
    ? `${ORIGIN}${imageData}`
    : imageData;
  return { uri, headers: authHeaders };
}

// ─── Image → base64 helper ───────────────────────────────────────────────────

/**
 * Fetches an image (relative path, absolute URL, or existing data URL) and
 * returns it as a base64 data URL suitable for sending to AI endpoints.
 * Relative paths are prefixed with ORIGIN and sent with session auth headers.
 */
export async function imageUrlToBase64(imageData: string): Promise<string> {
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  const uri = imageData.startsWith('/') ? `${ORIGIN}${imageData}` : imageData;
  const authHeaders = resolveAuthHeaders() as Record<string, string>;
  const response = await fetch(uri, { headers: authHeaders });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${uri} (${response.status})`);
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
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
