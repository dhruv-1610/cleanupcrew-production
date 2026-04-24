import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

/**
 * Custom hook for fetching API data with automatic polling, error handling,
 * and graceful fallback support.
 *
 * @param {string} url - API endpoint path
 * @param {*} fallback - Fallback value if API fails
 * @param {Object} options
 * @param {Function} options.transform - Transform function for raw response data
 * @param {number|null} options.pollInterval - Polling interval in ms (null = no polling)
 * @param {boolean} options.skip - Skip the fetch if true
 */
export function useApiData(url, fallback = null, options = {}) {
    const { transform, pollInterval = null, skip = false } = options;
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async (isPolling = false) => {
        if (skip) return;
        // Only set loading on initial fetch, not on polling
        if (!isPolling) setLoading(true);
        try {
            const { data: raw } = await api.get(url, { params: { _t: Date.now() } });
            if (!mountedRef.current) return;
            const result = transform ? transform(raw) : raw;
            setData(result);
            setError(null);
        } catch (err) {
            if (!mountedRef.current) return;
            // Only set error on initial fetch, polling failures are silent
            if (!isPolling) {
                setError(err);
                // Keep existing data on polling error, use fallback only on initial fail
                if (data === fallback) setData(fallback);
            }
        } finally {
            if (mountedRef.current && !isPolling) setLoading(false);
        }
    }, [url, skip]);

    // Initial fetch
    useEffect(() => {
        mountedRef.current = true;
        fetchData(false);
        return () => { mountedRef.current = false; };
    }, [fetchData]);

    // Polling
    useEffect(() => {
        if (pollInterval && pollInterval > 0 && !skip) {
            intervalRef.current = setInterval(() => {
                fetchData(true);
            }, pollInterval);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [pollInterval, fetchData, skip]);

    const refetch = useCallback(() => fetchData(false), [fetchData]);

    return { data, loading, error, refetch };
}
