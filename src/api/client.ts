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

// ─── Fallback token (from zena/Untitled-1.json — used while backend auth is
//     being aligned with Firebase ID tokens) ──────────────────────────────────

// Full cookie string copied from browser DevTools (preview.goryuz.com)
// Replace this whenever the session expires.
const FALLBACK_COOKIE =
  'goryuz-language=es; __Host-authjs.csrf-token=11e92702d1951daf8e22bcc48d3a24da47a54d505967efd62d34be6a5622aa6b%7Cdb17ab489780169cb0551bf700949a02b0c02ed881335f7f3994f58c031356cc; __Secure-authjs.callback-url=https%3A%2F%2Fpreview.goryuz.com%2F; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiM0U1NTNVWW15MU45MmNqdHoyWHV1WWZPMGcyUVI0bF9sdGVIckZqX1hPS2lHN29DcEVNaWZrQ1Y4aDItRDk4djZFN2pCNi1haF92YXJSOFktR0l4OGcifQ..BZGP8LXGl4-t6XiRxiHQSw.ZWQbG4YeJiNk9Y_ikSwA3fF0cU-APuRWTEmL64P3dLjUlDN648Vsx5mtgtpH9ynCq_EiNMFCNUNdVcxFvzsSzHh-8aNoo-1W-otVFPp5XgFnwpKQkDHbN4ARIZXsZ3AFuuyCR9Lf4LGO6OLKTK7acC1oA9bpurqTBnAZ_sq1e5lrIb3sYIeBLdAn25qgfNuTJ36Yt7RLN8PrbIoR7D9gCELRsPwcY5SUqx_pVYGM1UW77C_XWLh9KAgXuVfHp17w-C9v4qPVyz21h0dGm4CT65IrdN4KxdK4ONAiKT04YRbAOOBnf-kTOY1JMVNK5IjoYHATnXN-z6WkcO0tHaJT33BI9JPgtG6_CuZvAhb9sU2m9geLw8WjOz2gYqUaI0xGn4jv3h91xeaofspX881Oetft0RweBuUqkTifPo5fit60r7psrxYdAIrBZZl3NgKaV3-QLs-k_fR_dR5sF_ylEA.oOgagKzNZpVEL_wJ2hhn7GEma9VCRUL-lQWocM67TWE';

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

export const apiDelete = <T>(path: string) =>
  apiRequest<T>(path, { method: 'DELETE' });
