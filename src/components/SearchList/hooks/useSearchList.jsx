import { useState, useEffect, useCallback } from 'react';
import { searchMovies } from '@/api/ENDPOINTS';

/** @type {(query: string) => import('@/types/tmdb').UseSearchListReturn} */
const useSearchList = (query) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Reset pagination whenever query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
      setErrorMessage('');
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const fetchResults = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await searchMovies(query, currentPage);

        if (cancelled) return;

        if (data.response === 'false') {
          setErrorMessage(data.error || 'Failed to fetch results');
          setResults([]);
          return;
        }

        setResults(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setTotalResults(data.total_results || 0);
      } catch (error) {
        if (cancelled) return;
        console.error('useSearchList error:', error);
        setErrorMessage('Error fetching search results. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    // Small debounce to avoid spamming API on rapid page changes
    const timeoutId = setTimeout(fetchResults, 250);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query, currentPage]);

  const setPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
    setErrorMessage('');
  }, []);

  return {
    results,
    isLoading,
    errorMessage,
    currentPage,
    totalPages,
    totalResults,
    setPage,
    reset,
  };
};

export default useSearchList;
