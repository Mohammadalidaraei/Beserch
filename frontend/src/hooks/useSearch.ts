'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchApi } from '@/lib/api';
import type { SearchQuery, SearchResponse } from '@/types';

interface UseSearchOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const { debounceMs = 300, enabled = true } = options;
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !enabled) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await searchApi.search({
          q: searchQuery,
          type: 'all',
          page: 1,
          limit: 10,
        });
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.message || 'جستجو با خطا مواجه شد');
      } finally {
        setLoading(false);
      }
    },
    [enabled]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setData(null);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, performSearch]);

  return { data, loading, error, refetch: () => performSearch(query) };
}

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchApi.getSuggestions(query);
        setSuggestions(result);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
}
