import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        
        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setSubmitting(false);
        setSubmitted(true);
        setFeedback('');

        // Close after a short delay
        setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => setSubmitted(false), 300);
        }, 2000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[3000]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-80 glass-card-heavy p-5 rounded-2xl shadow-2xl border border-slate-700/50 mb-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-100 font-[var(--font-display)] flex items-center gap-2">
                                <MessageSquare size={18} className="text-emerald-400" />
                                Send Feedback
                            </h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="py-8 flex flex-col items-center justify-center text-center"
                            >
                                <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
                                <p className="text-slate-200 font-medium">Thank you for your feedback!</p>
                                <p className="text-xs text-slate-400 mt-1">We appreciate your input.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you think or report an issue..."
                                    className="w-full h-24 px-3 py-2 rounded-xl text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !feedback.trim()}
                                    className="w-full btn-primary !py-2 flex items-center justify-center gap-2 text-sm"
                                >
                                    {submitting ? 'Sending...' : (
                                        <>
                                            Submit <Send size={14} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:-translate-y-1 hover:shadow-emerald-500/20 transition-all ${
                    isOpen ? 'bg-slate-700 text-slate-200 border border-slate-600' : 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-slate-900'
                }`}
                aria-label="Give Feedback"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}
