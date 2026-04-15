import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MapPin, Camera, AlertTriangle, Send, CheckCircle2, Upload } from 'lucide-react';

export default function ReportSpot() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        description: '',
        severity: '',
        lat: '',
        lng: '',
        address: '',
    });

    if (!isAuthenticated) return <Navigate to="/login" />;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.description || !form.severity || !form.address) return;
        setSubmitted(true);
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }));
                },
                () => { /* fallback */ }
            );
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card-heavy p-12 text-center max-w-md"
                >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                        <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-16" />
                    </motion.div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 font-[var(--font-display)]">SPOT REPORTED!</h2>
                    <p className="text-gray-500 mb-16">Our team will verify this location soon. You'll be notified when a cleanup drive is created.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/map')} className="btn-primary">View on Map</button>
                        <button onClick={() => { setSubmitted(false); setForm({ description: '', severity: '', lat: '', lng: '', address: '' }); }} className="btn-secondary">
                            Report Another
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
                        REPORT A <span className="gradient-text">SPOT</span>
                    </h1>
                    <p className="text-gray-600 mb-16">Found a dirty location? Report it and our team will verify for a potential cleanup drive.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="glass-card-heavy p-10 space-y-6"
                >
                    {/* Photo upload */}
                    <div>
                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Upload Photo</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-emerald-500/30 transition-colors cursor-pointer">
                            <Upload size={32} className="text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
                            <p className="text-xs text-gray-600 mt-1">Max 5MB • JPG, PNG</p>
                            <input type="file" accept="image/*" className="hidden" />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Location</label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            placeholder="Enter address or area name"
                            className="w-full px-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none mb-3"
                        />
                        <button
                            type="button"
                            onClick={detectLocation}
                            className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <MapPin size={14} /> Detect my location
                        </button>
                        {form.lat && form.lng && (
                            <p className="text-xs text-gray-600 mt-2">📍 {form.lat}, {form.lng}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Describe the issue — what kind of waste, how much area, etc."
                            rows={4}
                            className="w-full px-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Severity Level</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'low', label: 'Low', color: 'border-green-500/30 bg-green-500/10 text-green-400' },
                                { value: 'medium', label: 'Medium', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' },
                                { value: 'high', label: 'High', color: 'border-orange-500/30 bg-orange-500/10 text-orange-400' },
                            ].map(s => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, severity: s.value }))}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${form.severity === s.value ? s.color : 'border-gray-200 bg-white text-gray-600'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
                        <Send size={16} /> Submit Report
                    </button>
                </motion.form>
            </div>
        </div>
    );
}
