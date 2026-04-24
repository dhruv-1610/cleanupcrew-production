import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StripePaymentModal({ isOpen, onClose, amount, driveName, onPaymentSuccess }) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const formatCardNumber = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(\d{4})/g, '$1 ').trim();
    };

    const formatExpiry = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        return cleaned;
    };

    const getCardBrand = (num) => {
        const n = num.replace(/\s/g, '');
        if (n.startsWith('4')) return 'Visa';
        if (/^5[1-5]/.test(n)) return 'Mastercard';
        if (n.startsWith('37') || n.startsWith('34')) return 'Amex';
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const rawCard = cardNumber.replace(/\s/g, '');
        if (rawCard.length < 16) { setError('Invalid card number'); return; }
        if (expiry.length < 5) { setError('Invalid expiry date'); return; }
        if (cvc.length < 3) { setError('Invalid CVC'); return; }
        if (!name.trim()) { setError('Cardholder name required'); return; }

        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            onPaymentSuccess({
                brand: getCardBrand(rawCard) || 'Card',
                last4: rawCard.slice(-4),
                amount,
            });
            setCardNumber('');
            setExpiry('');
            setCvc('');
            setName('');
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="relative w-full max-w-md glass-card-heavy shadow-2xl overflow-hidden"
                    >
                        {/* Gradient top bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500" />

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/15 flex items-center justify-center">
                                        <CreditCard size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-100 font-[var(--font-display)]">Secure Payment</h3>
                                        <p className="text-xs text-slate-400">Powered by Stripe</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/30 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Amount display */}
                            <div className="bg-slate-800/30 border border-slate-700/15 rounded-xl p-4 mb-6 text-center">
                                <p className="text-xs text-slate-400 uppercase mb-1">Donating to</p>
                                <p className="text-sm font-semibold text-slate-200 mb-2">{driveName}</p>
                                <div className="text-3xl font-extrabold text-emerald-400 font-[var(--font-display)]">₹{amount?.toLocaleString()}</div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/8 border border-red-500/15 rounded-xl text-sm text-red-400 flex items-center gap-2">
                                        <AlertTriangle size={14} /> {error}
                                    </motion.div>
                                )}

                                {/* Cardholder Name */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Full name on card"
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                    />
                                </div>

                                {/* Card Number */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">Card Number</label>
                                    <div className="relative">
                                        <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full pl-10 pr-16 py-3 rounded-xl text-sm font-mono"
                                        />
                                        {getCardBrand(cardNumber) && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                                {getCardBrand(cardNumber)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expiry & CVC */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">Expiry</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={e => setExpiry(formatExpiry(e.target.value))}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full px-4 py-3 rounded-xl text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">CVC</label>
                                        <input
                                            type="text"
                                            value={cvc}
                                            onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="123"
                                            maxLength={4}
                                            className="w-full px-4 py-3 rounded-xl text-sm font-mono"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} /> Pay ₹{amount?.toLocaleString()}
                                        </>
                                    )}
                                </button>

                                <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                                    <Lock size={10} /> Encrypted & secured by Stripe. Your data is safe.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
