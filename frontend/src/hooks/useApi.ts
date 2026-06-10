import { useState, useEffect, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null });

  const fetch = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "API request failed";
      setState({ data: null, loading: false, error: msg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}

export function useApiMutation<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const execute = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(input);
      setData(result);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "API request failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { execute, loading, error, data };
}
