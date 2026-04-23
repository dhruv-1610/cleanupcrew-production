import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiData } from '../hooks/useApiData';
import { apiBaseUrl } from '../lib/api';
import { MapPin, Calendar, Clock, Search, ChevronDown, ArrowRight, Users, DollarSign, Plus } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.6 } }),
};

// Stock images for drives that don't have a report photo
const stockImages = [
    '/images/cleanup_park_1776975755888.png',
    '/images/cleanup_beach_1776975771831.png',
    '/images/cleanup_urban_1776975789616.png',
    '/images/cleanup_river_1776975803886.png',
    '/images/cleanup_close_1776975821849.png',
];

export default function Drives() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');

    // Fetch drives
    const { data: drives, loading } = useApiData('/api/drives', [], {
        pollInterval: 15000, // Poll every 15s for real-time updates
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res.drives || []);
            return arr.map(d => ({
                ...d,
                id: d._id || d.id,
                location: { address: d.locationAddress || 'India', ...d.location },
                roles: d.roles || (d.requiredRoles ? Object.fromEntries(
                    d.requiredRoles.map(r => [r.role, { max: r.capacity, filled: r.booked || 0 }])
                ) : {}),
                currentVolunteers: d.currentVolunteers ?? d.requiredRoles?.reduce((s, r) => s + (r.booked || 0), 0) ?? 0,
                maxVolunteers: d.maxVolunteers ?? d.requiredRoles?.reduce((s, r) => s + r.capacity, 0) ?? 0,
                currentFunding: d.currentFunding ?? d.fundingRaised ?? 0,
                fundingGoal: d.fundingGoal ?? 0,
                severity: d.severity || 'medium',
                status: d.status === 'planned' ? 'upcoming' : d.status,
            }));
        }
    });

    // Fetch reports to get photos for drives (via reportId match)
    const { data: reports } = useApiData('/api/reports', [], {
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res.reports || []);
            return arr;
        }
    });

    // Build a reportId -> photoUrl map
    const reportPhotoMap = {};
    (reports || []).forEach(r => {
        const id = r._id || r.id;
        if (r.photoUrls?.length > 0) {
            const url = r.photoUrls[0];
            reportPhotoMap[id] = url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
        }
    });

    const allDrives = drives || [];

    const filtered = allDrives.filter(d => {
        const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) || d.locationAddress?.toLowerCase().includes(search.toLowerCase()) || d.location?.address?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        const matchSeverity = severityFilter === 'all' || d.severity === severityFilter;
        return matchSearch && matchStatus && matchSeverity;
    });

    // Get a photo for a drive
    const getDrivePhoto = (drive, index) => {
        // First try the report photo
        if (drive.reportId && reportPhotoMap[drive.reportId]) {
            return reportPhotoMap[drive.reportId];
        }
        // Fallback to stock image
        return stockImages[index % stockImages.length];
    };

    // Get location label from GeoJSON coordinates
    const getLocationLabel = (drive) => {
        if (drive.locationAddress && drive.locationAddress !== 'India') {
            return drive.locationAddress.split(',')[0];
        }
        if (drive.location?.address && drive.location.address !== 'India') {
            return drive.location.address.split(',')[0];
        }
        const parts = drive.title?.split(' ') || [];
        return parts.slice(0, 2).join(' ') || 'India';
    };

    return (
        <div className="min-h-screen pt-32 pb-24 relative">
            {/* Fixed background video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 1 }}
            >
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4" type="video/mp4" />
            </video>
            {/* Background overlay */}
            <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                zIndex: 2, 
                background: 'linear-gradient(to bottom, rgba(5, 13, 26, 0.8) 0%, rgba(5, 13, 26, 0.6) 100%)',
                backdropFilter: 'blur(3px)' 
            }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 3 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 font-[var(--font-display)] drop-shadow-md">
                                Cleanup Drives
                            </h1>
                            <p className="text-lg text-slate-300 max-w-lg drop-shadow-sm font-medium">Browse all cleanup drives across India. Join, donate, or organize your own.</p>
                        </div>
                        <Link to="/report" className="btn-primary flex items-center gap-2 !py-3 !px-6 self-start">
                            <Plus size={18} /> Report a Spot
                        </Link>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-10">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search drives by name or location..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-3 rounded-xl text-sm cursor-pointer min-w-[150px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={severityFilter}
                                    onChange={e => setSeverityFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-3 rounded-xl text-sm cursor-pointer min-w-[160px]"
                                >
                                    <option value="all">All Severity</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Loading drives...</p>
                    </div>
                )}

                {/* Results Count */}
                {!loading && <div className="text-sm font-medium text-slate-400 mb-8">{filtered.length} drive{filtered.length !== 1 ? 's' : ''} found</div>}

                {/* Grid */}
                {!loading && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filtered.map((drive, idx) => {
                        const volProgress = drive.maxVolunteers > 0 ? (drive.currentVolunteers / drive.maxVolunteers) * 100 : 0;
                        const fundProgress = drive.fundingGoal > 0 ? (drive.currentFunding / drive.fundingGoal) * 100 : 0;
                        const photo = getDrivePhoto(drive, idx);

                        return (
                            <motion.div key={drive.id} variants={fadeUp} className="glass-card hover:translate-y-[-4px] transition-all flex flex-col overflow-hidden">
                                {/* Drive Photo */}
                                <div className="relative h-44 overflow-hidden">
                                    <img 
                                        src={photo} 
                                        alt={drive.title} 
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.src = stockImages[idx % stockImages.length]; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-transparent to-transparent" />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className={`text-xs font-semibold uppercase py-1 px-3 rounded-full border backdrop-blur-sm ${drive.status === 'completed' ? 'bg-slate-900/70 text-slate-400 border-slate-500/15' : drive.status === 'active' ? 'bg-emerald-900/70 text-emerald-400 border-emerald-500/15' : 'bg-blue-900/70 text-blue-400 border-blue-500/15'}`}>
                                            {drive.status}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="text-xs font-medium uppercase tracking-wider text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                                            {drive.severity}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-100 mb-3 font-[var(--font-display)] line-clamp-2 leading-tight">
                                        {drive.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-5 border-b border-slate-700/15 pb-4">
                                        <MapPin size={16} className="text-emerald-400/60" />
                                        <span className="truncate">{getLocationLabel(drive)}</span>
                                    </div>

                                    {/* Role Breakdown */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {Object.entries(drive.roles).map(([role, { max, filled }]) => (
                                            <span key={role} className={`px-2 py-1 text-xs font-medium rounded-lg border ${filled >= max ? 'bg-slate-500/5 text-slate-500 border-slate-500/10 line-through' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'}`}>
                                                {role} {filled}/{max}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Progress Blocks */}
                                    <div className="bg-slate-800/30 border border-slate-700/15 rounded-xl p-3 mb-3">
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                                            <div className="flex items-center gap-1"><Users size={14} /> Volunteers</div>
                                            <span className="text-emerald-400">{drive.currentVolunteers} / {drive.maxVolunteers}</span>
                                        </div>
                                        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(volProgress, 100)}%` }} />
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/30 border border-slate-700/15 rounded-xl p-3 mb-6">
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                                            <div className="flex items-center gap-1"><DollarSign size={14} /> Funding</div>
                                            <span className="text-cyan-400">₹{((drive.currentFunding || 0) / 100000).toFixed(1)}k / ₹{((drive.fundingGoal || 0) / 100000).toFixed(1)}k</span>
                                        </div>
                                        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${Math.min(fundProgress, 100)}%` }} />
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-700/15 gap-3">
                                        <div className="flex flex-col text-xs text-slate-400 text-center sm:text-left">
                                            <div className="flex items-center gap-1 justify-center sm:justify-start"><Calendar size={12} /> {new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                        <Link
                                            to={`/drives/${drive.id}`}
                                            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-lg hover:bg-emerald-500/15 transition-all flex items-center justify-center gap-2"
                                        >
                                            {drive.status === 'completed' ? 'Impact' : 'Details'} <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20 glass-card max-w-2xl mx-auto mt-12">
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-100 font-[var(--font-display)] mb-3">No Drives Found</h3>
                        <p className="text-slate-400 mb-6">Try adjusting your search or filters.</p>
                        <Link to="/report" className="btn-primary inline-flex items-center gap-2">
                            <Plus size={16} /> Report a Dirty Spot
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
