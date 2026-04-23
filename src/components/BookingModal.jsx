import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Phone, HeartPulse, CheckSquare } from 'lucide-react';

export default function BookingModal({ isOpen, onClose, role, driveName, onConfirm }) {
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [medicalNotes, setMedicalNotes] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!emergencyName.trim() || !emergencyPhone.trim()) {
            setError('Emergency contact is required for safety.');
            return;
        }
        if (!agreeTerms) {
            setError('You must agree to the safety guidelines and liability waiver.');
            return;
        }

        setProcessing(true);
        try {
            await onConfirm({
                emergencyContact: {
                    name: emergencyName.trim(),
                    phone: emergencyPhone.trim()
                },
                medicalNotes: medicalNotes.trim()
            });
        } catch (err) {
            setError(err.message || 'Failed to process booking');
            setProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
                        className="relative w-full max-w-lg glass-card-heavy shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        {/* Gradient top bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500" />

                        <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/15 flex items-center justify-center">
                                        <UserPlus size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-100 font-[var(--font-display)]">Volunteer Registration</h3>
                                        <p className="text-xs text-slate-400">Complete details to secure your slot</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/30 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Drive info display */}
                            <div className="bg-slate-800/30 border border-slate-700/15 rounded-xl p-4 mb-6">
                                <p className="text-xs text-slate-400 uppercase mb-1">Booking for</p>
                                <p className="text-sm font-semibold text-slate-200">{driveName}</p>
                                <p className="text-emerald-400 text-xs font-medium mt-1">Role: <span className="uppercase">{role}</span></p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/8 border border-red-500/15 rounded-xl text-sm text-red-400">
                                        {error}
                                    </motion.div>
                                )}

                                {/* Emergency Contact */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                        <Phone size={14} className="text-emerald-500" /> Emergency Contact
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">Contact Name *</label>
                                            <input
                                                type="text"
                                                value={emergencyName}
                                                onChange={e => setEmergencyName(e.target.value)}
                                                placeholder="e.g. Jane Doe"
                                                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={emergencyPhone}
                                                onChange={e => setEmergencyPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Info */}
                                <div className="space-y-4 pt-2">
                                    <h4 className="text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                        <HeartPulse size={14} className="text-emerald-500" /> Medical & Allergies
                                    </h4>
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium mb-1.5 block uppercase tracking-wider">Conditions / Allergies (Optional)</label>
                                        <textarea
                                            value={medicalNotes}
                                            onChange={e => setMedicalNotes(e.target.value)}
                                            placeholder="e.g. Dust allergy, Asthma. Leave blank if none."
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 outline-none transition-all resize-none custom-scrollbar"
                                        />
                                    </div>
                                </div>

                                {/* Waiver */}
                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative mt-0.5 flex-shrink-0">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only"
                                                checked={agreeTerms}
                                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                            />
                                            <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${agreeTerms ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                                {agreeTerms && <CheckSquare size={14} className="text-white" />}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                            I agree to follow the safety guidelines (wear closed-toe shoes, gloves, etc.). I understand that participation is voluntary and the organizers are not liable for any injuries incurred during the drive.
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 mt-6 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
