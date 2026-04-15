import { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('cleanupcrew_user');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed);
                setIsAuthenticated(true);
            } catch (e) { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock login
        const loggedUser = { ...mockUser, email };
        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('cleanupcrew_user', JSON.stringify(loggedUser));
        return { success: true };
    };

    const register = (name, email, password, role) => {
        const newUser = {
            ...mockUser,
            id: 'user-' + Date.now(),
            name,
            email,
            role,
            joinedDate: new Date().toISOString().split('T')[0],
            drives: [],
            donations: [],
            badges: ['badge-001'],
            points: 0,
            rank: 100,
            hoursVolunteered: 0,
            wasteCollected: 0,
        };
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('cleanupcrew_user', JSON.stringify(newUser));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('cleanupcrew_user');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('cleanupcrew_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
