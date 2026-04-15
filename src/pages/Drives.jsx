import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockDrives } from '../data/mockData';
import { MapPin, Calendar, Clock, Search, ChevronDown, ArrowRight, Users, DollarSign } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.6 } }),
};

export default function Drives() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');

    const filtered = mockDrives.filter(d => {
        const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.location.address.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        const matchSeverity = severityFilter === 'all' || d.severity === severityFilter;
        return matchSearch && matchStatus && matchSeverity;
    });

    return (
        <div className="min-h-screen pt-32 pb-24 border-b-8 border-[#005202]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-[4px_4px_0px_#005202] uppercase font-[var(--font-display)]">
                        CLEANUP DRIVES
                    </h1>
                    <p className="text-xl font-bold text-white max-w-lg drop-shadow-md">Browse all cleanup drives across India. Join, donate, or organize your own.</p>
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-12">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008303]" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="SEARCH DRIVES BY NAME OR LOCATION..."
                                className="w-full pl-12 pr-4 py-3 bg-white border-4 border-[#005202] shadow-[4px_4px_0px_#005202] rounded-xl text-lg font-bold text-[#008303] placeholder-[#008303]/60 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all uppercase"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-3 bg-white border-4 border-[#005202] shadow-[4px_4px_0px_#005202] rounded-xl text-lg font-bold text-[#008303] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all uppercase cursor-pointer min-w-[160px]"
                                >
                                    <option value="all">ALL STATUS</option>
                                    <option value="active">ACTIVE</option>
                                    <option value="upcoming">UPCOMING</option>
                                    <option value="completed">COMPLETED</option>
                                </select>
                                <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#005202] pointer-events-none font-bold" />
                            </div>
                            <div className="relative">
                                <select
                                    value={severityFilter}
                                    onChange={e => setSeverityFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-3 bg-white border-4 border-[#005202] shadow-[4px_4px_0px_#005202] rounded-xl text-lg font-bold text-[#008303] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all uppercase cursor-pointer min-w-[180px]"
                                >
                                    <option value="all">ALL SEVERITY</option>
                                    <option value="critical">CRITICAL</option>
                                    <option value="high">HIGH</option>
                                    <option value="medium">MEDIUM</option>
                                </select>
                                <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#005202] pointer-events-none font-bold" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <div className="text-lg font-black text-white mb-8 drop-shadow-md uppercase">{filtered.length} DRIVE{filtered.length !== 1 ? 'S' : ''} FOUND</div>

                {/* Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filtered.map(drive => {
                        const volProgress = (drive.currentVolunteers / drive.maxVolunteers) * 100;
                        const fundProgress = (drive.currentFunding / drive.fundingGoal) * 100;

                        return (
                            <motion.div key={drive.id} variants={fadeUp} className="glass-card hover:translate-y-[-6px] transition-transform flex flex-col">
                                <div className="border-b-4 border-[#005202] p-4 bg-[#008303] flex justify-between items-center force-white">
                                    <span className={`text-xs font-black uppercase py-1.5 px-3 rounded-xl border-2 border-[#005202] shadow-[2px_2px_0px_#005202] ${drive.status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-white text-[#008303]'}`}>
                                        {drive.status}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-wider bg-[#005202] px-2 py-1 rounded shadow-sm">
                                        {drive.severity} SEVERITY
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-[#008303] mb-4 font-[var(--font-display)] line-clamp-2 leading-tight">
                                        {drive.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-[#006902] font-black mb-6 uppercase border-b-2 border-dashed border-[#005202]/20 pb-4">
                                        <MapPin size={18} />
                                        <span className="truncate">{drive.location.address.split(',')[0]}</span>
                                    </div>

                                    {/* Role Breakdown */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {Object.entries(drive.roles).map(([role, { max, filled }]) => (
                                            <span key={role} className={`px-2 py-1 text-xs font-black uppercase rounded-lg border-2 border-[#005202] ${filled >= max ? 'bg-gray-200 text-gray-500 line-through' : 'bg-[#f0fdf4] text-[#008303]'}`}>
                                                {role} {filled}/{max}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Progress Blocks (Bigger text, cleaner layout) */}
                                    <div className="bg-[#f0fdf4] border-2 border-[#005202] shadow-[2px_2px_0px_#005202] rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between font-black text-[#005202] mb-2 uppercase text-sm">
                                            <div className="flex items-center gap-1"><Users size={16} /> VOLUNTEERS</div>
                                            <span>{drive.currentVolunteers} / {drive.maxVolunteers}</span>
                                        </div>
                                        <div className="h-4 bg-white border-2 border-[#005202] rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-[#008303] border-r-2 border-[#005202]" style={{ width: `${volProgress}%` }} />
                                        </div>
                                    </div>

                                    <div className="bg-[#f0fdf4] border-2 border-[#005202] shadow-[2px_2px_0px_#005202] rounded-xl p-4 mb-8">
                                        <div className="flex items-center justify-between font-black text-[#005202] mb-2 uppercase text-sm">
                                            <div className="flex items-center gap-1"><DollarSign size={16} /> FUNDING</div>
                                            <span>₹{(drive.currentFunding / 1000).toFixed(0)}k / {(drive.fundingGoal / 1000).toFixed(0)}k</span>
                                        </div>
                                        <div className="h-4 bg-white border-2 border-[#005202] rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-yellow-400 border-r-2 border-[#005202]" style={{ width: `${fundProgress}%` }} />
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between pt-4 border-t-2 border-[#005202] gap-4">
                                        <div className="flex flex-col text-sm font-black text-[#005202] uppercase text-center sm:text-left">
                                            <div className="flex items-center gap-1 justify-center sm:justify-start"><Calendar size={14} /> {new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                            <div className="flex items-center gap-1 justify-center sm:justify-start"><Clock size={14} /> {drive.time}</div>
                                        </div>
                                        <Link
                                            to={`/drives/${drive.id}`}
                                            className="w-full sm:w-auto px-6 py-3 bg-[#008303] force-white font-black rounded-xl border-2 border-[#005202] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#005202] transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-wide"
                                        >
                                            {drive.status === 'completed' ? 'IMPACT' : 'DETAILS'} <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 glass-card max-w-2xl mx-auto mt-12">
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-3xl font-black text-[#008303] font-[var(--font-display)] mb-4">NO DRIVES FOUND</h3>
                        <p className="text-lg font-bold text-[#006902] uppercase">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
