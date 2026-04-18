import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { MapPin, Camera, AlertTriangle, Send, CheckCircle2, Upload } from 'lucide-react';

export default function ReportSpot() {
    const { isAuthenticated, loading: authLoading, apiOnline } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        description: '',
        severity: '',
        lat: '',
        lng: '',
        address: '',
    });
    const [photoName, setPhotoName] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated) return <Navigate to="/login" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!form.description || !form.severity || !form.address) {
            setErrorMsg('Please fill all required fields.');
            return;
        }
        if (!form.lat || !form.lng) {
            setErrorMsg('Please detect your location or enter coordinates.');
            return;
        }
        if (!fileInputRef.current?.files?.[0]) {
            setErrorMsg('Please upload a photo of the spot.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('description', form.description);
            formData.append('severity', form.severity);
            formData.append('lat', form.lat);
            formData.append('lng', form.lng);
            formData.append('photo', fileInputRef.current.files[0]);

            const res = await api.post('/api/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.duplicate) {
                setErrorMsg('A similar report already exists near this location. Your report was merged.');
            }

            setIsSubmitting(false);
            setSubmitted(true);
        } catch (err) {
            const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit report. Please try again.';
            setErrorMsg(msg);
            setIsSubmitting(false);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
                },
                (err) => {
                    setErrorMsg('Location detection failed. Please allow location access or enter manually.');
                }
            );
        } else {
            setErrorMsg('Geolocation is not supported by your browser.');
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
                        <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-6" />
                    </motion.div>
                    <h2 className="text-2xl font-extrabold text-slate-100 mb-2 font-[var(--font-display)]">Spot Reported!</h2>
                    <p className="text-slate-400 mb-6">Our team will verify this location soon. You'll be notified when a cleanup drive is created.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/map')} className="btn-primary">View on Map</button>
                        <button onClick={() => navigate('/drives')} className="btn-secondary">Browse Drives</button>
                        <button onClick={() => { setSubmitted(false); setForm({ description: '', severity: '', lat: '', lng: '', address: '' }); setPhotoName(''); setPhotoPreview(null); }} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors mt-2">
                            Report Another Spot
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
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-3 font-[var(--font-display)]">
                        Report a <span className="gradient-text">Spot</span>
                    </h1>
                    <p className="text-slate-400 mb-8">Found a dirty location? Report it and our team will verify for a potential cleanup drive.</p>
                </motion.div>

                {/* Error Message */}
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle size={16} /> {errorMsg}
                    </motion.div>
                )}

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="glass-card-heavy p-8 sm:p-10 space-y-6"
                >
                    {/* Photo upload */}
                    <div>
                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Upload Photo *</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700/30 rounded-xl p-10 text-center hover:border-emerald-500/20 transition-colors cursor-pointer bg-slate-800/20"
                        >
                            {photoPreview ? (
                                <div>
                                    <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl mx-auto mb-2 border border-emerald-500/20" />
                                    <p className="text-sm text-emerald-400 font-medium">{photoName}</p>
                                    <p className="text-xs text-slate-500 mt-1">Click to change</p>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} className="text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">Drag & drop or click to upload</p>
                                    <p className="text-xs text-slate-500 mt-1">Max 5MB • JPG, PNG</p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setPhotoName(file.name);
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setPhotoPreview(ev.target.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Location *</label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            placeholder="Enter address or area name"
                            className="w-full px-4 py-3 rounded-xl text-sm mb-3"
                        />
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={detectLocation}
                                className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/15"
                            >
                                <MapPin size={14} /> Detect my location
                            </button>
                            {form.lat && form.lng && (
                                <p className="text-xs text-emerald-400 font-medium">📍 {form.lat}, {form.lng}</p>
                            )}
                        </div>
                        {/* Manual coordinate input */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="Latitude" className="px-3 py-2 rounded-xl text-sm" />
                            <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="Longitude" className="px-3 py-2 rounded-xl text-sm" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Description *</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Describe the issue — what kind of waste, how much area, etc."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Severity Level *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'low', label: 'Low', active: 'border-green-500/30 bg-green-500/10 text-green-400' },
                                { value: 'medium', label: 'Medium', active: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' },
                                { value: 'high', label: 'High', active: 'border-orange-500/30 bg-orange-500/10 text-orange-400' },
                            ].map(s => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, severity: s.value }))}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${form.severity === s.value ? s.active : 'border-slate-700/20 bg-slate-800/30 text-slate-400 hover:border-slate-600/30'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!form.description || !form.severity || !form.lat || !form.lng || isSubmitting}
                        className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
                        ) : (
                            <><Send size={16} /> Submit Report</>
                        )}
                    </button>
                </motion.form>
            </div>
        </div>
    );
}
