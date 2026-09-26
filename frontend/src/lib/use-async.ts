import { useCallback, useEffect, useState } from "react";
import { useCircularity } from "@/contexts/CircularityContext";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  /** Manually re-run the loader. */
  reload: () => void;
}

/**
 * Runs an async loader from the mock service layer and re-runs it whenever the
 * shared demo state changes (via CircularityContext) so screens stay in sync
 * across role switches and mutations. Exposes loading/error/empty affordances.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const { version } = useCircularity();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch(() => {
        if (alive) setError("We couldn't load this right now.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, nonce, ...deps]);

  return { data, isLoading, error, reload };
}
