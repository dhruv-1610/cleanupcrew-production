import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useApiData } from '../hooks/useApiData';
import { apiBaseUrl } from '../lib/api';
import { MapPin, AlertTriangle, CheckCircle2, Clock, Filter, X, Layers, Navigation, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function FlyToCenter({ center }) {
    const map = useMap();
    useEffect(() => { map.flyTo(center, 5, { duration: 1.5 }); }, [center]);
    return null;
}

const severityColors = {
    critical: { fill: '#ef4444', stroke: '#dc2626' },
    high: { fill: '#f97316', stroke: '#ea580c' },
    medium: { fill: '#eab308', stroke: '#ca8a04' },
    low: { fill: '#22c55e', stroke: '#16a34a' },
};

const statusIcons = {
    reported: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15' },
    verified: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/15' },
    drive_created: { icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
    cleaned: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
};

export default function MapPage() {
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showLegend, setShowLegend] = useState(true);
    const [center] = useState([20.5937, 78.9629]); // Center of India

    // Fetch all reports for the map
    const { data: spots, loading } = useApiData('/api/reports', [], {
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res.reports || []);
            return arr.map(r => ({
                ...r,
                id: r._id || r.id,
                location: r.location?.coordinates
                    ? { lat: r.location.coordinates[1], lng: r.location.coordinates[0] }
                    : r.location,
                severity: r.severity || 'medium',
                status: r.status || 'reported',
                photoUrl: r.photoUrls?.[0] 
                    ? (r.photoUrls[0].startsWith('http') ? r.photoUrls[0] : `${apiBaseUrl}${r.photoUrls[0]}`)
                    : null,
            }));
        }
    });

    const allSpots = spots || [];
    const filteredSpots = allSpots.filter(s => statusFilter === 'all' || s.status === statusFilter);

    return (
        <div className="min-h-screen pt-16 relative">
            {/* Header */}
            <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-[var(--font-display)]">
                            Cleanup Map
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">{filteredSpots.length} reported spots across India</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Link to="/report" className="btn-primary flex items-center gap-2 !py-2 !px-4 !text-xs">
                            <Plus size={14} /> Report Spot
                        </Link>
                        {['all', 'reported', 'verified', 'drive_created', 'cleaned'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${statusFilter === s
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-800/30 text-slate-400 border-slate-700/15 hover:border-emerald-500/10'
                                    }`}
                            >
                                {s === 'all' ? 'All' : s === 'drive_created' ? 'Drive Created' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Map */}
            <div className="relative mx-4 sm:mx-6 lg:mx-8 mb-8" style={{ height: '65vh' }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-700/20 shadow-[0_4px_40px_rgba(0,0,0,0.4)]">
                    <MapContainer
                        center={center}
                        zoom={5}
                        style={{ height: '100%', width: '100%', background: '#0a1628' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        <FlyToCenter center={center} />

                        {filteredSpots.map(spot => {
                            const colors = severityColors[spot.severity] || severityColors.medium;
                            return (
                                <CircleMarker
                                    key={spot.id}
                                    center={[spot.location.lat, spot.location.lng]}
                                    radius={spot.severity === 'critical' ? 12 : spot.severity === 'high' ? 10 : 8}
                                    fillColor={colors.fill}
                                    color={colors.stroke}
                                    fillOpacity={0.4}
                                    weight={2}
                                    eventHandlers={{ click: () => setSelectedSpot(spot) }}
                                >
                                    <Popup>
                                        <div className="text-xs" style={{ color: '#0f172a', minWidth: 200 }}>
                                            {spot.photoUrl && (
                                                <img src={spot.photoUrl} alt="" className="w-full h-24 object-cover rounded mb-2" />
                                            )}
                                            <strong>{spot.description}</strong>
                                            <br />
                                            <span style={{ textTransform: 'capitalize' }}>Severity: {spot.severity}</span>
                                            <br />
                                            <span style={{ textTransform: 'capitalize' }}>Status: {spot.status}</span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Legend */}
                <AnimatePresence>
                    {showLegend && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute bottom-6 left-6 z-[1000]"
                        >
                            <div className="glass-card-heavy p-4 min-w-[180px]">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Severity</h4>
                                    <button onClick={() => setShowLegend(false)} className="text-slate-500 hover:text-slate-300">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(severityColors).map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.fill, boxShadow: `0 0 8px ${val.fill}40` }} />
                                            <span className="text-xs text-slate-300 capitalize">{key}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!showLegend && (
                    <button
                        onClick={() => setShowLegend(true)}
                        className="absolute bottom-6 left-6 z-[1000] p-2.5 glass-card-heavy rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                        <Layers size={18} />
                    </button>
                )}

                {/* Stats overlay */}
                <div className="absolute top-6 right-6 z-[1000]">
                    <div className="glass-card-heavy p-4 min-w-[160px]">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Quick Stats</h4>
                        <div className="space-y-2">
                            {Object.entries(statusIcons).map(([status, { icon: Icon, color, bg, border }]) => {
                                const count = allSpots.filter(s => s.status === status).length;
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon size={14} className={color} />
                                            <span className="text-xs text-slate-300 capitalize">{status.replace('_', ' ')}</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${bg} ${color} border ${border}`}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected spot detail */}
            <AnimatePresence>
                {selectedSpot && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
                    >
                        <div className="glass-card-heavy p-5">
                            <div className="flex gap-4">
                                {selectedSpot.photoUrl && (
                                    <img src={selectedSpot.photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-slate-700/20" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-base font-bold text-slate-100 line-clamp-2">{selectedSpot.description}</h3>
                                        <button onClick={() => setSelectedSpot(null)} className="text-slate-500 hover:text-slate-300 p-1 flex-shrink-0">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-3">📍 {selectedSpot.location.lat.toFixed(4)}, {selectedSpot.location.lng.toFixed(4)}</div>
                                    <div className="flex gap-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize border ${(statusIcons[selectedSpot.status] || statusIcons.reported).bg} ${(statusIcons[selectedSpot.status] || statusIcons.reported).color} ${(statusIcons[selectedSpot.status] || statusIcons.reported).border}`}>
                                            {selectedSpot.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize border`} style={{
                                            backgroundColor: `${severityColors[selectedSpot.severity].fill}15`,
                                            color: severityColors[selectedSpot.severity].fill,
                                            borderColor: `${severityColors[selectedSpot.severity].fill}25`,
                                        }}>
                                            {selectedSpot.severity} severity
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
