/**
 * crashlytics.ts
 *
 * Thin wrapper around @react-native-firebase/crashlytics.
 *
 * Rule: log to Crashlytics every error that would meaningfully impact the user
 * experience. All failed API requests are logged automatically via the API
 * client; call logError() for any other significant non-fatal errors.
 */

import crashlytics from '@react-native-firebase/crashlytics';

// ─── Generic non-fatal error ──────────────────────────────────────────────────

/**
 * Log a non-fatal error to Crashlytics.
 *
 * @param error   The caught error (any shape).
 * @param context Human-readable label for where the error occurred.
 */
export function logError(error: unknown, context?: string): void {
  try {
    const message =
      error instanceof Error ? error.message : String(error);

    if (context) {
      crashlytics().setAttribute('error_context', context);
    }

    const err =
      error instanceof Error ? error : new Error(message);

    crashlytics().recordError(err);
  } catch {
    // Never let the logger itself crash the app
  }
}

// ─── API-specific logger ──────────────────────────────────────────────────────

/**
 * Log a failed API request to Crashlytics.
 * Attaches the endpoint so failed requests can be pinpointed in the dashboard.
 *
 * @param endpoint  The URL path that failed (e.g. "/profile").
 * @param error     The caught error.
 */
export function logApiError(endpoint: string, error: unknown): void {
  try {
    const message =
      error instanceof Error ? error.message : String(error);

    crashlytics().setAttributes({
      api_endpoint: endpoint,
      error_context: 'api_request_failure',
    });

    const err =
      error instanceof Error
        ? error
        : new Error(`API error on ${endpoint}: ${message}`);

    crashlytics().recordError(err);
  } catch {
    // Never let the logger itself crash the app
  }
}
