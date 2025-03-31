import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.CACHE_URL;

const useCache = (cacheKey) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data from cache
  const fetchCache = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get?key=${cacheKey}`, {
        method: 'GET',
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      } else {
        setData(null); // No cache found
      }
    } catch (err) {
      setError('Failed to fetch cache');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  // Update cache with new data
  const updateCache = useCallback(async (newData, expiration = 3600) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cacheKey, value: newData, expiration }),
      });
      const result = await response.json();
      if (result.success) {
        setData(newData); // Update local state
        return true;
      } else {
        throw new Error('Cache update failed');
      }
    } catch (err) {
      setError('Failed to update cache');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  // Invalidate cache
  const invalidateCache = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/invalidate?key=${cacheKey}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setData(null); // Clear local state
        return true;
      } else {
        throw new Error('Cache invalidation failed');
      }
    } catch (err) {
      setError('Failed to invalidate cache');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  return { data, loading, error, fetchCache, updateCache, invalidateCache };
};

export default useCache;