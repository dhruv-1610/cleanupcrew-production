import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** For image src like /uploads/... */
export const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

// ── Token helpers ──────────────────────────────────────────────────────────
function getAccessToken() {
  return localStorage.getItem('cc_access_token');
}
function getRefreshToken() {
  return localStorage.getItem('cc_refresh_token');
}
export function setTokens(access, refresh) {
  if (access) localStorage.setItem('cc_access_token', access);
  if (refresh) localStorage.setItem('cc_refresh_token', refresh);
}
export function clearTokens() {
  localStorage.removeItem('cc_access_token');
  localStorage.removeItem('cc_refresh_token');
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');
  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: refresh });
  setTokens(data.accessToken, null);
  return data.accessToken;
}

// ── Request: attach JWT ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: 401 → try refresh, then fail ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status !== 401 || config._retried) {
      return Promise.reject(error);
    }
    config._retried = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      await refreshPromise;
      refreshPromise = null;
      const newToken = getAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      }
    } catch {
      refreshPromise = null;
    }

    clearTokens();
    return Promise.reject(error);
  }
);

// ── Convenience wrappers ───────────────────────────────────────────────────

/** Check if the backend is reachable */
export async function isApiAvailable() {
  try {
    await axios.get(`${baseURL}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
