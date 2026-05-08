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
  '__Host-authjs.csrf-token=11e92702d1951daf8e22bcc48d3a24da47a54d505967efd62d34be6a5622aa6b%7Cdb17ab489780169cb0551bf700949a02b0c02ed881335f7f3994f58c031356cc; __Secure-authjs.callback-url=https%3A%2F%2Fpreview.goryuz.com%2F; goryuz-language=es; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiM0U1NTNVWW15MU45MmNqdHoyWHV1WWZPMGcyUVI0bF9sdGVIckZqX1hPS2lHN29DcEVNaWZrQ1Y4aDItRDk4djZFN2pCNi1haF92YXJSOFktR0l4OGcifQ..NglTlq7Pcnc7tBggNit1VA.ZsdnINbuR7vVOzFniJxmmTAVM1UI3PUQOrOmaXg-L3K6cOJ8T7_TdhTYMQrX9iqCyZBSn57lypMQw68qiOPbOyUESgm7odqDMGp3BAbT7XNWkqeRIurErjXi2WpY4eGCfR1dOgWKKrBZyS1BIzhxkDXEVAUgoa2SmtJpQ5U_6e_UFMJeIA18I3Qn6RbbgJbCbx5ck6_3TmNF8OTj5ZckIOrqNLjdNEM2PreZuZ-2nkGQeR03RhRopcIezmEU56kieNaMxHGZItf7TNGxl1Lmm0101_e7InJCRa06KC5txWdgQ0Uei4I2tyWl4friL6ES-kexW7wE5Oym7PpTUrmtTyhWojz8Y6QOkIDea9Mmwfz5Nl0XM26NgWaHS2NZLz4tOwsxmuhRMUJdCNEyOsC5ZOurM0Q2ispV-sYt9nfL_rGXUDOqi8FS8tS8dTMF5W9ufedxOfCDsLUP_wkQMIVLuQ.ufaf74E2ARYiXIP7ktGPy5iVz-IgbC8krLx5PpTZOXY';

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
