import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useApiData } from '../hooks/useApiData';
import { apiBaseUrl } from '../lib/api';
import { MapPin, AlertTriangle, CheckCircle2, Clock, X, Eye, Plus, ArrowRight, Globe, Camera, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function FlyToLocation({ center, zoom }) {
    const map = useMap();
    useEffect(() => { map.flyTo(center, zoom || 5, { duration: 1.5 }); }, [center, zoom]);
    return null;
}

/* ── Marker colors now based on STATUS (much more intuitive) ── */
const statusMarkerColors = {
    reported:     { fill: '#ef4444', stroke: '#dc2626' },  // Red — needs attention
    verified:     { fill: '#f59e0b', stroke: '#d97706' },  // Amber — confirmed
    drive_created:{ fill: '#3b82f6', stroke: '#2563eb' },  // Blue — drive scheduled
    cleaned:      { fill: '#10b981', stroke: '#059669' },  // Green — done!
};

const statusConfig = {
    reported:      { icon: AlertTriangle, label: 'Needs Review',    emoji: '🔴', dotClass: 'bg-red-500' },
    verified:      { icon: Clock,         label: 'Verified',        emoji: '🟡', dotClass: 'bg-amber-500' },
    drive_created: { icon: MapPin,        label: 'Drive Scheduled', emoji: '🔵', dotClass: 'bg-blue-500' },
    cleaned:       { icon: CheckCircle2,  label: 'Cleaned ✓',      emoji: '🟢', dotClass: 'bg-emerald-500' },
};

export default function MapPage() {
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showSidebar, setShowSidebar] = useState(true);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
    const [mapZoom, setMapZoom] = useState(5);
    const [hoveredSpot, setHoveredSpot] = useState(null);

    const { data: spots } = useApiData('/api/reports', [], {
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

    const flyToSpot = (spot) => {
        setSelectedSpot(spot);
        setMapCenter([spot.location.lat, spot.location.lng]);
        setMapZoom(14);
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 30) return `${days}d ago`;
        return `${Math.floor(days / 30)}mo ago`;
    };

    const severityLabel = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High', critical: '🔴 Critical' };

    return (
        <div className="min-h-screen pt-16 bg-[#050d1a]">
            {/* ─── Hero Header ─── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/15 flex items-center justify-center">
                                <Globe size={28} className="text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-[var(--font-display)]">
                                    Cleanup <span className="gradient-text">Map</span>
                                </h1>
                                <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {allSpots.length} spots · {allSpots.filter(s => s.status === 'cleaned').length} cleaned
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link to="/report" className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                                <Plus size={16} /> Report Spot
                                <ArrowRight size={14} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </Link>
                            <div className="h-8 w-px bg-slate-700/30 mx-1 hidden sm:block" />
                            {/* Status filter tabs — each shows colored dot + label */}
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border ${statusFilter === 'all'
                                    ? 'bg-slate-700/30 text-white border-slate-600/30'
                                    : 'bg-slate-800/40 text-slate-400 border-slate-700/20 hover:text-slate-300'
                                }`}
                            >
                                All ({allSpots.length})
                            </button>
                            {Object.entries(statusConfig).map(([key, cfg]) => {
                                const count = allSpots.filter(s => s.status === key).length;
                                const markerColor = statusMarkerColors[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setStatusFilter(key === statusFilter ? 'all' : key)}
                                        className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all border ${statusFilter === key
                                            ? 'bg-slate-700/30 text-white border-slate-600/30'
                                            : 'bg-slate-800/40 text-slate-400 border-slate-700/20 hover:text-slate-300'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: markerColor.fill }} />
                                        {cfg.label}
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/40">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── Main Layout: Sidebar + Map ─── */}
            <div className="flex gap-0 px-4 sm:px-6 lg:px-8 pb-8 max-w-[1920px] mx-auto" style={{ height: 'calc(100vh - 180px)' }}>

                {/* ─── Sidebar: Spot Cards ─── */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ opacity: 0, x: -20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 360 }}
                            exit={{ opacity: 0, x: -20, width: 0 }}
                            className="flex-shrink-0 overflow-hidden"
                        >
                            <div className="w-[360px] h-full flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/20 rounded-l-2xl overflow-hidden">
                                {/* Sidebar Header */}
                                <div className="p-4 border-b border-slate-700/20 bg-gradient-to-r from-slate-800/40 to-slate-900/40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Camera size={16} className="text-emerald-400" />
                                            <span className="text-sm font-bold text-slate-200">Reported Spots</span>
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-md font-semibold">{filteredSpots.length}</span>
                                        </div>
                                        <button onClick={() => setShowSidebar(false)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Spot Cards */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 p-2">
                                    {filteredSpots.map((spot, idx) => {
                                        const cfg = statusConfig[spot.status] || statusConfig.reported;
                                        const markerColor = statusMarkerColors[spot.status] || statusMarkerColors.reported;
                                        const isSelected = selectedSpot?.id === spot.id;

                                        return (
                                            <motion.div
                                                key={spot.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                onClick={() => flyToSpot(spot)}
                                                onMouseEnter={() => setHoveredSpot(spot.id)}
                                                onMouseLeave={() => setHoveredSpot(null)}
                                                className={`group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${isSelected
                                                    ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                                                    : 'border-slate-700/15 bg-slate-800/20 hover:bg-slate-800/40 hover:border-slate-600/30'
                                                }`}
                                            >
                                                <div className="flex gap-3 p-3">
                                                    {/* Photo */}
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700/20 bg-slate-800/50 relative">
                                                        {spot.photoUrl ? (
                                                            <img src={spot.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-800/80">
                                                                <MapPin size={20} className="text-slate-600" />
                                                            </div>
                                                        )}
                                                        {/* Status dot on photo */}
                                                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-slate-900/80" style={{ backgroundColor: markerColor.fill }} />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug mb-1.5">{spot.description}</p>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                                                                style={{
                                                                    backgroundColor: `${markerColor.fill}15`,
                                                                    color: markerColor.fill,
                                                                    borderColor: `${markerColor.fill}30`,
                                                                }}
                                                            >
                                                                {cfg.label}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">{getTimeAgo(spot.createdAt)}</span>
                                                        </div>
                                                    </div>

                                                    <ChevronRight size={14} className={`text-slate-600 flex-shrink-0 mt-1 transition-all ${isSelected ? 'text-emerald-400' : 'group-hover:text-slate-400'}`} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {filteredSpots.length === 0 && (
                                        <div className="text-center py-16 px-4">
                                            <MapPin size={32} className="text-slate-600 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 mb-1">No spots found</p>
                                            <p className="text-xs text-slate-500">Try changing the filter</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle sidebar */}
                {!showSidebar && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setShowSidebar(true)}
                        className="absolute left-8 top-1/2 z-[1000] p-2.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/20 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors shadow-xl"
                    >
                        <Eye size={18} />
                    </motion.button>
                )}

                {/* ─── Map ─── */}
                <div className="flex-1 relative">
                    <div className={`absolute inset-0 overflow-hidden border border-slate-700/20 shadow-[0_4px_60px_rgba(0,0,0,0.5)] ${showSidebar ? 'rounded-r-2xl' : 'rounded-2xl'}`}>
                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '100%', width: '100%', background: '#070f1e' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            />
                            <FlyToLocation center={mapCenter} zoom={mapZoom} />

                            {filteredSpots.map(spot => {
                                /* Color by STATUS — not severity */
                                const colors = statusMarkerColors[spot.status] || statusMarkerColors.reported;
                                const isActive = selectedSpot?.id === spot.id || hoveredSpot === spot.id;
                                return (
                                    <CircleMarker
                                        key={spot.id}
                                        center={[spot.location.lat, spot.location.lng]}
                                        radius={isActive ? 14 : 9}
                                        fillColor={colors.fill}
                                        color={isActive ? '#fff' : colors.stroke}
                                        fillOpacity={isActive ? 0.8 : 0.55}
                                        weight={isActive ? 3 : 2}
                                        eventHandlers={{ click: () => flyToSpot(spot) }}
                                    >
                                        <Popup>
                                            <div style={{ color: '#0f172a', minWidth: 240, fontFamily: 'Inter, sans-serif' }}>
                                                {spot.photoUrl && (
                                                    <img src={spot.photoUrl} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                                                )}
                                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>{spot.description}</div>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: 11, textTransform: 'capitalize', background: `${colors.fill}18`, color: colors.fill, padding: '3px 10px', borderRadius: 6, fontWeight: 700, border: `1px solid ${colors.fill}30` }}>
                                                        {(statusConfig[spot.status]?.label || spot.status).replace('_', ' ')}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: '#64748b', padding: '3px 8px' }}>
                                                        {severityLabel[spot.severity] || spot.severity} severity
                                                    </span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                );
                            })}
                        </MapContainer>

                        {/* Gradient edges */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            background: `
                                linear-gradient(to right, rgba(5,13,26,0.5) 0%, transparent 4%, transparent 96%, rgba(5,13,26,0.3) 100%),
                                linear-gradient(to bottom, rgba(5,13,26,0.4) 0%, transparent 6%, transparent 94%, rgba(5,13,26,0.5) 100%)
                            `
                        }} />

                        {/* ─── Single clean legend panel (replaces both old panels) ─── */}
                        <div className="absolute top-5 right-5 z-[1000]">
                            <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-700/25 rounded-xl p-4 shadow-2xl min-w-[200px]">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Map Legend</h4>
                                <div className="space-y-2.5">
                                    {Object.entries(statusConfig).map(([status, cfg]) => {
                                        const count = allSpots.filter(s => s.status === status).length;
                                        const color = statusMarkerColors[status];
                                        const isFilterActive = statusFilter === status;
                                        return (
                                            <div
                                                key={status}
                                                onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
                                                className={`flex items-center justify-between cursor-pointer group rounded-lg px-2 py-1.5 -mx-2 transition-all ${isFilterActive ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative">
                                                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.fill, boxShadow: `0 0 10px ${color.fill}50` }} />
                                                    </div>
                                                    <span className={`text-xs font-medium transition-colors ${isFilterActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-100'}`}>{cfg.label}</span>
                                                </div>
                                                <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-md"
                                                    style={{
                                                        backgroundColor: `${color.fill}15`,
                                                        color: color.fill,
                                                    }}
                                                >
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Selected Spot Detail Flyout ─── */}
            <AnimatePresence>
                {selectedSpot && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/25 rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                            {/* Photo banner */}
                            {selectedSpot.photoUrl && (
                                <div className="relative h-36 overflow-hidden">
                                    <img src={selectedSpot.photoUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/30 to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <h3 className="text-base font-bold text-white line-clamp-2 drop-shadow-lg">{selectedSpot.description}</h3>
                                    </div>
                                </div>
                            )}

                            <div className="p-5">
                                {!selectedSpot.photoUrl && (
                                    <h3 className="text-base font-bold text-slate-100 mb-3">{selectedSpot.description}</h3>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {/* Status badge */}
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
                                            style={{
                                                backgroundColor: `${statusMarkerColors[selectedSpot.status]?.fill || '#666'}15`,
                                                color: statusMarkerColors[selectedSpot.status]?.fill || '#888',
                                                borderColor: `${statusMarkerColors[selectedSpot.status]?.fill || '#666'}30`,
                                            }}
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusMarkerColors[selectedSpot.status]?.fill }} />
                                            {(statusConfig[selectedSpot.status]?.label || selectedSpot.status).replace('_', ' ')}
                                        </span>
                                        {/* Severity */}
                                        <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/40 text-slate-300 border border-slate-700/20">
                                            {severityLabel[selectedSpot.severity] || selectedSpot.severity}
                                        </span>
                                        {/* Coords */}
                                        <span className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/15 rounded-lg">
                                            📍 {selectedSpot.location.lat.toFixed(4)}, {selectedSpot.location.lng.toFixed(4)}
                                        </span>
                                    </div>
                                    <button onClick={() => { setSelectedSpot(null); setMapCenter([20.5937, 78.9629]); setMapZoom(5); }} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all flex-shrink-0">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.4); }
            `}</style>
        </div>
    );
}
