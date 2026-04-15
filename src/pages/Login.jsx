import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill all fields'); return; }
        setLoading(true);
        setTimeout(() => {
            const result = login(email, password);
            if (result.success) navigate('/dashboard');
            else setError('Invalid credentials');
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
            >
                <div className="glass-card-heavy p-10 sm:p-10">
                    {/* Logo */}
                    <div className="text-center mb-16">
                        <Link to="/" className="inline-flex items-center gap-3 mb-16">
                            <img src="/images/logo-dark.png" alt="CleanupCrew" className="h-20 w-auto" />
                        </Link>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight font-[var(--font-display)]">
                            WELCOME <span className="gradient-text">BACK</span>
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Sign in to continue your mission</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-10 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-500">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                                Join the Crew
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
