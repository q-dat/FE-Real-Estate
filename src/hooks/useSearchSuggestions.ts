'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RentalSearchResult, SearchKind } from '@/types/rentalGridItem';

interface UseSearchSuggestionsOptions {
  debounce?: number;
  limit?: number;
}

interface UseSearchSuggestionsReturn {
  results: RentalSearchResult[];
  isSearching: boolean;
  error: boolean;
  cacheRef: React.MutableRefObject<Map<string, RentalSearchResult[]>>;
  run: (term: string, kind: SearchKind) => void;
  reset: () => void;
}

const minLengthFor = (kind: SearchKind) => (kind === 'code' ? 1 : 2);

// Hook chung cho cả Header (desktop) và HeaderResponsive (mobile).
// Gọi /api/search?q=&type=, dùng AbortController + cache theo (type|term).
// Desktop/mobile cùng một backend + cùng cache key -> kết quả nhất quán.
export function useSearchSuggestions(
  opts: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsReturn {
  const { debounce = 450, limit = 8 } = opts;
  const [results, setResults] = useState<RentalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, RentalSearchResult[]>>(new Map());
  const reqIdRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const run = useCallback(
    (term: string, kind: SearchKind) => {
      const trimmed = term.trim();
      const id = ++reqIdRef.current;

      if (trimmed.length < minLengthFor(kind)) {
        setResults([]);
        setIsSearching(false);
        setError(false);
        return;
      }

      const cacheKey = `${kind}|${trimmed}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setResults(cached);
        setIsSearching(false);
        setError(false);
        return;
      }

      setIsSearching(true);
      setError(false);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(trimmed)}&type=${kind}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error('search failed');
          const data = (await res.json()) as { results?: RentalSearchResult[] };
          const hits = data.results ?? [];
          const capped = limit ? hits.slice(0, limit) : hits;
          cacheRef.current.set(cacheKey, capped);
          if (id === reqIdRef.current) setResults(capped);
          void kind;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
          if (id === reqIdRef.current) {
            setError(true);
            setResults([]);
          }
        } finally {
          if (id === reqIdRef.current) setIsSearching(false);
        }
      }, debounce);
    },
    [debounce, limit]
  );

  const reset = useCallback(() => {
    setResults([]);
    setIsSearching(false);
    setError(false);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { results, isSearching, error, cacheRef, run, reset };
}
