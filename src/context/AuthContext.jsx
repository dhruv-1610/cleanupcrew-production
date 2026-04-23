import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setTokens, clearTokens } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [apiOnline, setApiOnline] = useState(false);

    // ── Boot: try to restore session from stored JWT ───────────────────────
    useEffect(() => {
        async function restoreSession() {
            const token = localStorage.getItem('cc_access_token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data.user);
                    setIsAuthenticated(true);
                    setApiOnline(true);
                    setLoading(false);
                    return;
                } catch {
                    // Token expired or API down
                    clearTokens();
                }
            }

            setLoading(false);
        }
        restoreSession();
    }, []);

    // ── Login ──────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        // Try real API first
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setTokens(data.accessToken, data.refreshToken);

            // Fetch full user profile
            const meRes = await api.get('/auth/me');
            const u = meRes.data.user;
            setUser(u);
            setIsAuthenticated(true);
            setApiOnline(true);
            localStorage.setItem('cleanupcrew_user', JSON.stringify(u));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error?.message || 'Invalid credentials' };
        }
    }, []);

    // ── Register ───────────────────────────────────────────────────────────
    const register = useCallback(async (name, email, password, role) => {
        // Try real API first
        try {
            const { data } = await api.post('/auth/register', { name, email, password });

            // DO NOT auto-login. User must verify email.
            return { success: true, message: data.message || 'Registration successful. Please check your email to verify your account.' };
        } catch (err) {
            return { success: false, error: err.response?.data?.error?.message || 'Registration failed' };
        }
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        clearTokens();
        localStorage.removeItem('cleanupcrew_user');
    }, []);

    // ── Refresh user from backend (re-fetch /auth/me) ──────────────────────
    const refreshUser = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/me');
            const u = data.user;
            setUser(u);
            localStorage.setItem('cleanupcrew_user', JSON.stringify(u));
            return u;
        } catch {
            // If API fails, keep current user state
            return user;
        }
    }, [user]);

    // ── Update user profile ────────────────────────────────────────────────
    const updateUser = useCallback(async (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('cleanupcrew_user', JSON.stringify(updated));

        if (apiOnline) {
            try {
                await api.patch('/api/users/me', updates);
            } catch { /* silent — local state already updated */ }
        }
    }, [user, apiOnline]);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated, loading, apiOnline,
            login, register, logout, updateUser, refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
