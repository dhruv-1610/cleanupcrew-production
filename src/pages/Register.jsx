import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Users, DollarSign } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { register: doRegister, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (isAuthenticated) return <Navigate to="/dashboard" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!name || !email || !password || !confirmPassword || !role) { setError('Please fill all fields'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const result = await doRegister(name, email, password, role);
            if (result.success) {
                setSuccessMsg(result.message || 'Registration successful. Please check your email.');
                // Don't navigate, let them read the message
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-32 relative">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                <div className="glass-card-heavy p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6">
                            <img src="/images/logo-dark.png" alt="CleanupCrew" className="h-14 w-auto" />
                        </Link>
                        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-[var(--font-display)]">
                            Join the <span className="gradient-text">Crew</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Create your account and start making impact</p>
                    </div>

                    {successMsg ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-2">Check your email</h3>
                            <p className="text-slate-400 mb-6">{successMsg}</p>
                            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                                Go to Login <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/8 border border-red-500/15 rounded-xl text-sm text-red-400 text-center">
                                    {error}
                                </motion.div>
                            )}

                            <div>
                                <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                                </div>
                            </div>

                            {/* Role selection */}
                            <div>
                                <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Select Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('volunteer')}
                                        className={`p-4 rounded-xl border text-center transition-all ${role === 'volunteer'
                                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                                : 'bg-slate-800/30 border-slate-700/15 text-slate-400 hover:border-emerald-500/15'
                                            }`}
                                    >
                                        <Users size={24} className="mx-auto mb-2" />
                                        <div className="text-sm font-bold">Volunteer</div>
                                        <div className="text-[10px] mt-1 opacity-70">Join cleanup drives</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('donor')}
                                        className={`p-4 rounded-xl border text-center transition-all ${role === 'donor'
                                                ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                                                : 'bg-slate-800/30 border-slate-700/15 text-slate-400 hover:border-cyan-500/15'
                                            }`}
                                    >
                                        <DollarSign size={24} className="mx-auto mb-2" />
                                        <div className="text-sm font-bold">Donor</div>
                                        <div className="text-[10px] mt-1 opacity-70">Fund the mission</div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                                        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
                                ) : (
                                    <>Create Account <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    )}

                    {!successMsg && (
                        <div className="text-center mt-6">
                            <p className="text-sm text-slate-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
