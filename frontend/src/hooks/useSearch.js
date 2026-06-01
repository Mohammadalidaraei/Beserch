import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async (searchQuery, searchType = 'web', pageNum = 1) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      switch (searchType) {
        case 'images':
          data = await api.searchImages(searchQuery, { page: pageNum });
          break;
        case 'videos':
          data = await api.searchVideos(searchQuery, { page: pageNum });
          break;
        case 'news':
          data = await api.searchNews(searchQuery, { page: pageNum });
          break;
        case 'ai':
          data = await api.aiSearch(searchQuery, { page: pageNum });
          break;
        default:
          data = await api.search(searchQuery, { page: pageNum });
      }
      
      setResults(data.results || []);
      setTotalResults(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      const data = await api.getSuggestions(searchQuery);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions([]);
    }
  }, []);

  const clearResults = () => {
    setResults([]);
    setTotalResults(0);
    setPage(1);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    suggestions,
    page,
    totalResults,
    search,
    fetchSuggestions,
    clearResults,
    setPage,
  };
}

export default useSearch;
