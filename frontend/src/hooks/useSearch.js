import { useState, useEffect, useCallback } from 'react';
import { searchApi } from '../lib/api';
import { useDebounce } from 'use-debounce';

export function useSearch(initialQuery = '', initialType = 'web') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, 300);
  const [searchType, setSearchType] = useState(initialType);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      searchApi.suggestions(debouncedQuery)
        .then(res => setSuggestions(res.data.suggestions || []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Search function
  const performSearch = useCallback(async (searchQuery = query, pageNum = 1, type = searchType) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (type) {
        case 'images':
          response = await searchApi.images(searchQuery, pageNum);
          break;
        case 'videos':
          response = await searchApi.videos(searchQuery, pageNum);
          break;
        case 'news':
          response = await searchApi.news(searchQuery, pageNum);
          break;
        default:
          response = await searchApi.web(searchQuery, pageNum);
      }
      
      if (pageNum === 1) {
        setResults(response.data.results || []);
      } else {
        setResults(prev => [...prev, ...(response.data.results || [])]);
      }
      
      setTotalResults(response.data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در جستجو');
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  // Initial search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, 1, searchType);
    }
  }, [debouncedQuery, searchType, performSearch]);

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && results.length < totalResults) {
      performSearch(query, page + 1, searchType);
    }
  }, [loading, results.length, totalResults, query, page, searchType, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setPage(1);
  };

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    results,
    loading,
    error,
    page,
    totalResults,
    suggestions,
    performSearch,
    loadMore,
    clearSearch,
  };
}

export default useSearch;
