import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MapPin, Menu, X, User, LogOut, LayoutDashboard, Heart, Trophy, Shield, Eye } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
    }, [location]);

    const navLinks = [
        { path: '/', label: 'Home', icon: MapPin },
        { path: '/drives', label: 'Drives', icon: MapPin },
        { path: '/map', label: 'Map', icon: MapPin },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/transparency', label: 'Transparency', icon: Eye },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-[rgba(2,10,4,0.85)] backdrop-blur-xl border-b border-[rgba(16,185,129,0.1)]'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-18">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <img
                                src="/images/logo-dark.png"
                                alt="CleanupCrew"
                                className="h-9 w-auto"
                            />
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold tracking-tight font-[var(--font-display)]">
                                    <span className="text-gray-900">CLEANUP</span>
                                    <span className="text-emerald-400">CREW</span>
                                </span>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive(path)
                                        ? 'text-emerald-400'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                    {isActive(path) && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:border-emerald-400/40 transition-all duration-300"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-gray-900 text-xs font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-emerald-300">{user?.name?.split(' ')[0]}</span>
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-2xl"
                                            >
                                                <div className="px-3 py-2 border-b border-gray-200 mb-1">
                                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded-full">
                                                        {user?.role}
                                                    </span>
                                                </div>
                                                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-gray-900 hover:bg-white shadow-sm border border-gray-100 rounded-lg transition-colors">
                                                    <LayoutDashboard size={16} /> Dashboard
                                                </Link>
                                                {user?.role === 'admin' && (
                                                    <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-gray-900 hover:bg-white shadow-sm border border-gray-100 rounded-lg transition-colors">
                                                        <Shield size={16} /> Admin Panel
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-900 transition-colors">
                                        Log In
                                    </Link>
                                    <Link to="/register" className="btn-primary !py-2 !px-5 !text-sm">
                                        Join the Crew
                                    </Link>
                                </div>
                            )}

                            {/* Mobile toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-16 left-0 right-0 z-40 bg-[rgba(2,10,4,0.95)] backdrop-blur-xl border-b border-gray-200 lg:hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(path)
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm border border-gray-100'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
                                    <Link to="/login" className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-gray-900 rounded-xl hover:bg-white shadow-sm border border-gray-100 transition-colors">
                                        Log In
                                    </Link>
                                    <Link to="/register" className="block w-full text-center btn-primary !py-3">
                                        Join the Crew
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
