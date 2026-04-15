import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { mockDrives, mockSpots } from '../data/mockData';
import { MapPin, Layers, ZoomIn, X, ExternalLink, Calendar, Users, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker creation
function createMarker(color, size = 12) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:2px solid rgba(255,255,255,0.3);
      box-shadow:0 0 10px ${color}60, 0 0 20px ${color}30;
    "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

const statusConfig = {
    reported: { color: '#f87171', label: 'Reported', marker: () => createMarker('#f87171') },
    verified: { color: '#fb923c', label: 'Verified', marker: () => createMarker('#fb923c') },
    drive_created: { color: '#60a5fa', label: 'Drive Created', marker: () => createMarker('#60a5fa') },
    cleaned: { color: '#34d399', label: 'Cleaned', marker: () => createMarker('#34d399') },
    active: { color: '#10b981', label: 'Active Drive', marker: () => createMarker('#10b981', 16) },
    upcoming: { color: '#818cf8', label: 'Upcoming Drive', marker: () => createMarker('#818cf8', 14) },
    completed: { color: '#6b7280', label: 'Completed Drive', marker: () => createMarker('#6b7280', 14) },
};

export default function MapPage() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add spot markers
        mockSpots.forEach(spot => {
            const config = statusConfig[spot.status];
            if (!config) return;
            const marker = L.marker([spot.location.lat, spot.location.lng], { icon: config.marker() });
            marker.addTo(map);
            marker.on('click', () => setSelectedItem({ type: 'spot', data: spot }));
        });

        // Add drive markers
        mockDrives.forEach(drive => {
            const config = statusConfig[drive.status];
            if (!config) return;
            const marker = L.marker([drive.location.lat, drive.location.lng], { icon: config.marker() });
            marker.addTo(map);
            marker.on('click', () => setSelectedItem({ type: 'drive', data: drive }));
        });

        mapInstanceRef.current = map;
        setLoaded(true);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="min-h-screen pt-16">
            {/* Map container */}
            <div className="relative h-[calc(100vh-64px)]">
                <div ref={mapRef} className="absolute inset-0 z-0" />

                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 left-4 z-10 glass-card p-4 max-w-[200px]"
                >
                    <h3 className="text-sm font-bold text-gray-900 mb-3 font-[var(--font-display)]">MAP LEGEND</h3>
                    <div className="space-y-2">
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }} />
                                <span className="text-xs text-gray-500">{cfg.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Stats overlay */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-6 left-4 z-10 glass-card p-4"
                >
                    <div className="flex gap-12">
                        <div className="text-center">
                            <div className="text-lg font-extrabold text-emerald-400 font-[var(--font-display)]">{mockSpots.length}</div>
                            <div className="text-[10px] text-gray-600 uppercase">Spots</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-extrabold text-emerald-400 font-[var(--font-display)]">{mockDrives.filter(d => d.status === 'active').length}</div>
                            <div className="text-[10px] text-gray-600 uppercase">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-extrabold text-emerald-400 font-[var(--font-display)]">{mockDrives.filter(d => d.status === 'completed').length}</div>
                            <div className="text-[10px] text-gray-600 uppercase">Cleaned</div>
                        </div>
                    </div>
                </motion.div>

                {/* Side panel for selection */}
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-4 right-4 z-10 glass-card-heavy w-[320px] max-h-[calc(100vh-120px)] overflow-y-auto"
                    >
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-16">
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full`}
                                    style={{ background: `${statusConfig[selectedItem.data.status]?.color}20`, color: statusConfig[selectedItem.data.status]?.color }}>
                                    {statusConfig[selectedItem.data.status]?.label}
                                </span>
                                <button onClick={() => setSelectedItem(null)} className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            {selectedItem.type === 'drive' ? (
                                <>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 font-[var(--font-display)]">{selectedItem.data.title}</h3>
                                    <p className="text-xs text-gray-500 mb-16 leading-relaxed">{selectedItem.data.description}</p>

                                    <div className="space-y-2 mb-16">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin size={12} className="text-emerald-500/60" />
                                            <span>{selectedItem.data.location.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={12} className="text-emerald-500/60" />
                                            <span>{new Date(selectedItem.data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} • {selectedItem.data.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Users size={12} className="text-emerald-500/60" />
                                            <span>{selectedItem.data.currentVolunteers}/{selectedItem.data.maxVolunteers} volunteers</span>
                                        </div>
                                    </div>

                                    <div className="mb-16">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="text-emerald-400 font-semibold">{Math.round((selectedItem.data.currentVolunteers / selectedItem.data.maxVolunteers) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white shadow-sm border border-gray-100 rounded-full overflow-hidden">
                                            <div className="progress-fill h-full" style={{ width: `${(selectedItem.data.currentVolunteers / selectedItem.data.maxVolunteers) * 100}%` }} />
                                        </div>
                                    </div>

                                    <a href={`/drives/${selectedItem.data.id}`} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-colors">
                                        View Drive <ExternalLink size={14} />
                                    </a>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 font-[var(--font-display)]">Reported Spot</h3>
                                    <p className="text-sm text-gray-500 mb-16">{selectedItem.data.description}</p>
                                    <div className="space-y-2 mb-16">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <AlertTriangle size={12} className={
                                                selectedItem.data.severity === 'critical' ? 'text-red-400' :
                                                    selectedItem.data.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                                            } />
                                            <span className="capitalize">{selectedItem.data.severity} Severity</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={12} className="text-emerald-500/60" />
                                            <span>Reported {new Date(selectedItem.data.reportedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
