import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, MapPin, ScanLine } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, attendance, driveTitle, driveLocation, driveDate }) {
    if (!attendance) return null;

    const formattedDate = driveDate ? new Date(driveDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-6 text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#10b981,_transparent_70%)]" />
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 rounded-full transition-all">
                                <X size={18} />
                            </button>
                            <h3 className="text-xl font-bold text-white font-[var(--font-display)] mb-1">Entry Pass</h3>
                            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">{attendance.role}</p>
                        </div>

                        {/* Body */}
                        <div className="p-8 text-center bg-white relative">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-8 right-8 border-t border-dashed border-slate-300" />
                            
                            <h4 className="text-lg font-bold text-slate-800 mb-6">{driveTitle}</h4>

                            <div className="bg-slate-50 p-4 rounded-2xl inline-block mb-6 shadow-inner border border-slate-100 relative group">
                                <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/20 rounded-2xl transition-colors duration-500" />
                                <QRCodeSVG 
                                    value={attendance.qrCode} 
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#0f172a"
                                />
                                {/* Scan animation line */}
                                <motion.div 
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                                    className="absolute left-0 right-0 h-0.5 bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)] z-10 hidden group-hover:block"
                                />
                            </div>

                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-6 flex items-center justify-center gap-1">
                                <ScanLine size={14} /> Show at check-in
                            </p>

                            <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <Calendar size={16} className="text-emerald-500 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Date & Time</div>
                                        <div className="text-sm font-medium text-slate-700">{formattedDate}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-emerald-500 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Location</div>
                                        <div className="text-sm font-medium text-slate-700">{driveLocation}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
