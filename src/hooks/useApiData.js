import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Custom hook: fetch from API, fall back to mock data if API is down.
 * @param {string} url — API endpoint (e.g. '/api/drives')
 * @param {*} mockFallback — fallback data if API fails
 * @param {object} opts — { params, transform, skip }
 */
export function useApiData(url, mockFallback, opts = {}) {
    const { params, transform, skip = false } = opts;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (skip) {
            setData(mockFallback);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchData() {
            setLoading(true);
            try {
                const res = await api.get(url, { params, timeout: 5000 });
                if (!cancelled) {
                    const result = transform ? transform(res.data) : res.data;
                    setData(result);
                    setIsLive(true);
                }
            } catch {
                if (!cancelled) {
                    setData(mockFallback);
                    setIsLive(false);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [url, skip]);

    return { data, loading, error, isLive, refetch: () => {
        setLoading(true);
        api.get(url, { params, timeout: 5000 })
            .then(res => {
                const result = transform ? transform(res.data) : res.data;
                setData(result);
                setIsLive(true);
            })
            .catch(() => {
                setData(mockFallback);
                setIsLive(false);
            })
            .finally(() => setLoading(false));
    }};
}
