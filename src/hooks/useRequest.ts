/**
 * useRequest.ts
 *
 * Generic hook for data fetching with loading and error states.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useRequest(fetchProfile);
 *
 * - Starts loading immediately on mount.
 * - `error` is a plain string (ready to pass to t() or display directly).
 * - `refetch()` re-runs the fetcher and resets state.
 * - API failures are already logged to Crashlytics by the client; the hook
 *   surfaces the error state to the UI without double-logging.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useRequest<T>(fetcher: () => Promise<T>): UseRequestState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a counter to trigger re-fetches from refetch()
  const [fetchCount, setFetchCount] = useState(0);

  // Keep the latest fetcher ref so the effect is stable across renders
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? `HTTP ${err.status}`
              : err instanceof Error
                ? err.message
                : 'Unknown error';

          setError(message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchCount]);

  const refetch = useCallback(() => {
    setFetchCount(c => c + 1);
  }, []);

  return { data, loading, error, refetch };
}

export default useRequest;
