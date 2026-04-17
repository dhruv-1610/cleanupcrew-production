import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState(token ? 'loading' : 'error');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setMessage('Invalid or missing verification link.');
            return;
        }
        
        let cancelled = false;
        
        api.get('/auth/verify-email', { params: { token } })
            .then(() => {
                if (!cancelled) {
                    setStatus('success');
                    setMessage('Your email has been verified. You can now log in to your account.');
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setStatus('error');
                    const msg = err?.response?.data?.error?.message || 'Verification failed. The link may have expired or is invalid.';
                    setMessage(msg);
                }
            });
            
        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
            >
                <div className="glass-card-heavy p-8 sm:p-10 text-center">
                    <Link to="/" className="inline-flex items-center gap-3 mb-8">
                        <img src="/images/logo-dark.png" alt="CleanupCrew" className="h-12 w-auto" />
                    </Link>

                    {status === 'loading' && (
                        <div className="py-8">
                            <Loader2 size={48} className="mx-auto text-emerald-400 animate-spin mb-4" />
                            <h2 className="text-xl font-bold text-slate-100 mb-2">Verifying Email</h2>
                            <p className="text-slate-400">Please wait while we verify your email address...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-6">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">Verification Complete</h2>
                            <p className="text-slate-400 mb-8">{message}</p>
                            <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
                                Continue to Login <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-6">
                            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">Verification Failed</h2>
                            <p className="text-slate-400 mb-8">{message}</p>
                            
                            <div className="flex flex-col gap-3">
                                <Link to="/register" className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
                                    Register Again <ArrowRight size={16} />
                                </Link>
                                <Link to="/login" className="px-6 py-3.5 rounded-xl border border-slate-700/50 bg-slate-800/30 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all flex items-center justify-center">
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
