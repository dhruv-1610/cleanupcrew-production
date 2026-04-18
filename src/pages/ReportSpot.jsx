import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { MapPin, Send, CheckCircle2, Upload, AlertTriangle, Crosshair, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom green marker icon
const pinIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) { setPosition([e.latlng.lat, e.latlng.lng]); },
    });
    return position ? <Marker position={position} icon={pinIcon} /> : null;
}

function FlyTo({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1.2 }); }, [center]);
    return null;
}

export default function ReportSpot() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [submitted, setSubmitted] = useState(false);
    const [position, setPosition] = useState(null);
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoName, setPhotoName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [flyTarget, setFlyTarget] = useState(null);

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated) return <Navigate to="/login" />;

    // Reverse geocode position to address
    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data.display_name) setAddress(data.display_name.split(',').slice(0, 3).join(', '));
        } catch { /* silent */ }
    };

    // When position changes, reverse geocode
    const handlePositionChange = (pos) => {
        setPosition(pos);
        setFlyTarget(pos);
        reverseGeocode(pos[0], pos[1]);
    };

    // Detect GPS
    const detectLocation = () => {
        setDetectingLocation(true);
        setErrorMsg('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = [pos.coords.latitude, pos.coords.longitude];
                handlePositionChange(loc);
                setDetectingLocation(false);
            },
            () => { setErrorMsg('Location access denied. Please search or click the map.'); setDetectingLocation(false); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Search location
    const searchLocation = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in`);
            const data = await res.json();
            if (data[0]) {
                const loc = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                handlePositionChange(loc);
                setAddress(data[0].display_name.split(',').slice(0, 3).join(', '));
            } else { setErrorMsg('Location not found. Try a different search or click the map.'); }
        } catch { setErrorMsg('Search failed. Click the map to pick location.'); }
        setSearching(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!position) { setErrorMsg('Please select a location on the map.'); return; }
        if (!fileInputRef.current?.files?.[0]) { setErrorMsg('Please upload a photo.'); return; }
        if (!description) { setErrorMsg('Please add a description.'); return; }
        if (!severity) { setErrorMsg('Please select severity.'); return; }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('lat', position[0].toString());
            formData.append('lng', position[1].toString());
            formData.append('description', description);
            formData.append('severity', severity);
            formData.append('photo', fileInputRef.current.files[0]);
            await api.post('/api/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSubmitted(true);
        } catch (err) {
            setErrorMsg(err.response?.data?.error?.message || 'Failed to submit. Try again.');
        }
        setIsSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-heavy p-12 text-center max-w-md">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                        <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-6" />
                    </motion.div>
                    <h2 className="text-2xl font-extrabold text-slate-100 mb-2 font-[var(--font-display)]">Spot Reported!</h2>
                    <p className="text-slate-400 mb-6">Our team will verify and schedule a cleanup drive soon.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/map')} className="btn-primary">View on Map</button>
                        <button onClick={() => navigate('/drives')} className="btn-secondary">Browse Drives</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const severities = [
        { value: 'low', label: 'Low', desc: 'Minor litter', color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/25' },
        { value: 'medium', label: 'Medium', desc: 'Scattered waste', color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25' },
        { value: 'high', label: 'High', desc: 'Heavy dumping', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/25' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-2 font-[var(--font-display)]">
                        Report a <span className="gradient-text">Dirty Spot</span>
                    </h1>
                    <p className="text-slate-400 mb-8">Pick the location, snap a photo, and we'll handle the rest.</p>
                </motion.div>

                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle size={16} /> {errorMsg}
                    </motion.div>
                )}

                <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Location Picker ── */}
                    <div className="glass-card-heavy p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={18} className="text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">1. Pick Location</h3>
                        </div>

                        {/* Search + Detect Row */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                                    placeholder="Search area, city, landmark..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                                />
                            </div>
                            <button type="button" onClick={searchLocation} disabled={searching}
                                className="px-4 py-3 rounded-xl text-sm font-semibold bg-slate-800/50 text-slate-300 border border-slate-700/20 hover:border-emerald-500/20 hover:text-emerald-400 transition-all disabled:opacity-50">
                                {searching ? '...' : 'Search'}
                            </button>
                            <button type="button" onClick={detectLocation} disabled={detectingLocation}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all disabled:opacity-50 whitespace-nowrap">
                                <Crosshair size={16} className={detectingLocation ? 'animate-spin' : ''} />
                                {detectingLocation ? 'Detecting...' : 'My Location'}
                            </button>
                        </div>

                        {/* Map */}
                        <div className="rounded-xl overflow-hidden border border-slate-700/20 shadow-lg" style={{ height: 320 }}>
                            <MapContainer center={[20.5937, 78.9629]} zoom={5} maxZoom={18} style={{ height: '100%', width: '100%', background: '#070f1e' }} zoomControl={false}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={18} maxNativeZoom={18} />
                                <LocationPicker position={position} setPosition={handlePositionChange} />
                                {flyTarget && <FlyTo center={flyTarget} />}
                            </MapContainer>
                        </div>

                        {/* Selected address */}
                        {position && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-sm">
                                <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
                                <span className="text-emerald-300 font-medium">{address || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`}</span>
                            </motion.div>
                        )}
                        {!position && (
                            <p className="text-xs text-slate-500 text-center">👆 Click on the map, search a location, or use "My Location"</p>
                        )}
                    </div>

                    {/* ── Photo Upload ── */}
                    <div className="glass-card-heavy p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Upload size={18} className="text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">2. Upload Photo</h3>
                        </div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${photoPreview ? 'border-emerald-500/25 bg-emerald-500/3' : 'border-slate-700/30 bg-slate-800/20 hover:border-emerald-500/20'}`}
                        >
                            {photoPreview ? (
                                <div className="flex items-center gap-4 justify-center">
                                    <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-emerald-500/20" />
                                    <div className="text-left">
                                        <p className="text-sm text-emerald-400 font-semibold">{photoName}</p>
                                        <p className="text-xs text-slate-500 mt-1">Click to change photo</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload size={36} className="text-slate-500 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400 font-medium">Click to upload a photo of the spot</p>
                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG • Max 5MB</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setPhotoName(file.name);
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setPhotoPreview(ev.target.result);
                                    reader.readAsDataURL(file);
                                }
                            }} />
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div className="glass-card-heavy p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-emerald-400 text-lg">📝</span>
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">3. Describe the Issue</h3>
                        </div>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="What kind of waste? How large is the area? Any hazards?"
                            rows={3} className="w-full px-4 py-3 rounded-xl text-sm resize-none" />
                    </div>

                    {/* ── Severity ── */}
                    <div className="glass-card-heavy p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={18} className="text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">4. How Bad Is It?</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {severities.map(s => (
                                <button key={s.value} type="button" onClick={() => setSeverity(s.value)}
                                    className={`py-4 rounded-xl text-center border-2 transition-all ${severity === s.value
                                        ? `${s.bg} ${s.border}` : 'border-slate-700/20 bg-slate-800/30 hover:border-slate-600/30'}`}
                                >
                                    <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: s.color, boxShadow: severity === s.value ? `0 0 12px ${s.color}50` : 'none' }} />
                                    <div className={`text-sm font-bold ${severity === s.value ? 'text-white' : 'text-slate-300'}`}>{s.label}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={!position || !description || !severity || isSubmitting}
                        className="btn-primary w-full flex items-center justify-center gap-2 !py-4 disabled:opacity-40 text-base font-bold">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
                        ) : (
                            <><Send size={18} /> Submit Report</>
                        )}
                    </button>
                </motion.form>
            </div>
        </div>
    );
}
