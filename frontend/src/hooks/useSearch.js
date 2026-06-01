import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchType, setSearchType] = useState('web'); // web, images, videos, news, ai

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let data;
        switch (searchType) {
          case 'images':
            data = await api.imageSearch(searchQuery);
            break;
          case 'videos':
            data = await api.videoSearch(searchQuery);
            break;
          case 'news':
            data = await api.newsSearch(searchQuery);
            break;
          case 'ai':
            data = await api.aiSearch(searchQuery);
            break;
          default:
            data = await api.search(searchQuery);
        }
        setResults(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300),
    [searchType]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const data = await api.getSuggestions(searchQuery);
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    }, 200),
    []
  );

  useEffect(() => {
    if (query) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, fetchSuggestions]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setError(null);
  };

  return {
    query,
    results,
    loading,
    error,
    suggestions,
    searchType,
    setSearchType,
    handleSearch,
    clearSearch,
    setQuery,
  };
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default useSearch;
