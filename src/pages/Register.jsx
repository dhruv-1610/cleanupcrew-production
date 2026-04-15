import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const [loading, setLoading] = useState(false);
    const { register: doRegister } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password || !confirmPassword || !role) { setError('Please fill all fields'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        setTimeout(() => {
            const result = doRegister(name, email, password, role);
            if (result.success) navigate('/dashboard');
            else setError('Registration failed');
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-32 relative">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                <div className="glass-card-heavy p-10 sm:p-10">
                    <div className="text-center mb-16">
                        <Link to="/" className="inline-flex items-center gap-3 mb-16">
                            <img src="/images/logo-dark.png" alt="CleanupCrew" className="h-20 w-auto" />
                        </Link>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight font-[var(--font-display)]">
                            JOIN THE <span className="gradient-text">CREW</span>
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Create your account and start making impact</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                                    className="w-full pl-10 pr-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none" />
                            </div>
                        </div>

                        {/* Role selection */}
                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Select Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('volunteer')}
                                    className={`p-4 rounded-xl border text-center transition-all ${role === 'volunteer'
                                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500/20'
                                        }`}
                                >
                                    <Users size={24} className="mx-auto mb-2" />
                                    <div className="text-sm font-bold">Volunteer</div>
                                    <div className="text-[10px] mt-1">Join cleanup drives</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('donor')}
                                    className={`p-4 rounded-xl border text-center transition-all ${role === 'donor'
                                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500/20'
                                        }`}
                                >
                                    <DollarSign size={24} className="mx-auto mb-2" />
                                    <div className="text-sm font-bold">Donor</div>
                                    <div className="text-[10px] mt-1">Fund the mission</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                                    className="w-full pl-10 pr-10 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none" />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-500">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                                    className="w-full pl-10 pr-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
