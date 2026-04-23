import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApiData } from '../hooks/useApiData';
import HlsVideoBg from '../components/HlsVideoBg';
import { Award, Trophy, DollarSign, TrendingUp, Crown, Medal, Star } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.5 } }),
};

const AVAILABLE_BADGES = [
    { id: 'b1', name: 'First Drop', description: 'Participated in first drive', requirement: '1 Drive', icon: 'Star' },
    { id: 'b2', name: 'Eco Warrior', description: 'Completed 5 cleanups', requirement: '5 Drives', icon: 'Leaf' },
    { id: 'b3', name: 'Heavy Lifter', description: 'Collected 50kg+ waste', requirement: '50kg Waste', icon: 'Trophy' },
    { id: 'b4', name: 'Seed Funder', description: 'Made first donation', requirement: '1 Donation', icon: 'DollarSign' }
];

export default function Leaderboard() {
    const [tab, setTab] = useState('volunteers');

    const { data: leaderboard, loading } = useApiData('/api/leaderboard', { volunteers: [], donors: [] }, {
        transform: (res) => {
            const raw = res?.leaderboard || res || {};
            return {
                volunteers: raw?.volunteers || [],
                donors: raw?.donors || [],
            };
        }
    });

    const volunteers = leaderboard?.volunteers || [];
    const donors = leaderboard?.donors || [];

    const rankStyle = (rank) => {
        if (rank === 1) return 'bg-[rgba(234,179,8,0.06)] border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.08)]';
        if (rank === 2) return 'bg-[rgba(148,163,184,0.04)] border border-slate-400/15';
        if (rank === 3) return 'bg-[rgba(251,146,60,0.04)] border border-orange-400/15';
        return 'glass-card';
    };

    const rankIcon = (rank) => {
        if (rank === 1) return <Crown size={28} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />;
        if (rank === 2) return <Medal size={24} className="text-slate-300" />;
        if (rank === 3) return <Medal size={24} className="text-orange-400" />;
        return <span className="text-xl font-bold text-slate-400 block w-8 text-center">{rank}</span>;
    };

    return (
        <div className="min-h-screen pt-32 pb-24 relative">
            {/* Fixed Background Video */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <HlsVideoBg 
                    src="https://stream.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo.m3u8" 
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-slate-950/40" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <img src="/images/logo-light.png" alt="Logo" className="h-16 w-auto mx-auto mb-6 opacity-80" />
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-100 tracking-tight mb-3 font-[var(--font-display)]">
                        Leaderboard
                    </h1>
                    <p className="text-lg text-slate-400 max-w-lg mx-auto">
                        The heroes making our communities cleaner
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-12">
                    <div className="flex gap-1 p-1 bg-slate-800/30 backdrop-blur-sm border border-slate-700/15 rounded-xl">
                        <button
                            onClick={() => setTab('volunteers')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'volunteers' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            <Trophy size={18} /> Volunteers
                        </button>
                        <button
                            onClick={() => setTab('donors')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'donors' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' : 'text-slate-400 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            <DollarSign size={18} /> Donors
                        </button>
                    </div>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Loading leaderboard...</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && (tab === 'volunteers' ? volunteers : donors).length === 0 && (
                    <div className="glass-card p-16 text-center">
                        <Trophy size={48} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-300 mb-2">No {tab} yet</h3>
                        <p className="text-sm text-slate-400">Be the first to {tab === 'volunteers' ? 'volunteer at a drive' : 'donate to a drive'}!</p>
                    </div>
                )}

                {/* Top 3 Podium */}
                {!loading && (tab === 'volunteers' ? volunteers : donors).length >= 3 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12 items-end h-72"
                >
                    {(tab === 'volunteers' ? [volunteers[1], volunteers[0], volunteers[2]] : [donors[1], donors[0], donors[2]]).map((u, idx) => {
                        if (!u) return <div key={`empty-${idx}`} className="flex flex-col items-center opacity-0" />;
                        
                        const heights = ['h-28', 'h-44', 'h-20'];
                        const positions = [2, 1, 3];
                        const pos = positions[idx];
                        const val = tab === 'volunteers' ? (u.points || 0).toLocaleString() + ' pts' : '₹' + ((u.amount || 0) / 100).toLocaleString('en-IN');

                        return (
                            <motion.div key={u.rank || idx} variants={fadeUp} className="flex flex-col items-center">
                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name || 'Unknown'}`} alt={u.name} className={`bg-slate-800 rounded-xl mb-3 object-cover border border-slate-700/20 ${pos === 1 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                                <div className="text-sm font-semibold text-slate-200 text-center mb-1">{(u.name || 'Unknown').split(' ')[0]}</div>
                                <div className="text-xs font-medium text-emerald-400 mb-2 bg-emerald-500/8 px-3 py-1 rounded-lg border border-emerald-500/10">{val}</div>

                                <div className={`w-full ${heights[idx]} bg-gradient-to-t from-slate-800/40 to-slate-800/10 border border-slate-700/15 flex items-start pt-4 justify-center rounded-t-xl backdrop-blur-sm`}>
                                    <div className="flex flex-col items-center">
                                        {rankIcon(pos)}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
                )}

                {/* Full list */}
                {!loading && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                    className="space-y-3 max-w-4xl mx-auto"
                >
                    {(tab === 'volunteers' ? volunteers : donors).map((item, index) => {
                        if (!item) return null;
                        return (
                        <motion.div
                            key={item.rank}
                            variants={fadeUp}
                            className={`flex items-center gap-5 p-4 rounded-xl hover:-translate-y-0.5 transition-all relative ${rankStyle(item.rank)}`}
                        >
                            <div className="w-10 flex-shrink-0 flex items-center justify-center">
                                {rankIcon(item.rank)}
                            </div>
                            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.name}`} className="w-12 h-12 bg-slate-800 border border-slate-700/20 rounded-xl flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                                <div className="text-lg font-bold text-slate-100 truncate font-[var(--font-display)]">{item.name}</div>
                                <div className="text-sm text-slate-400">
                                    {tab === 'volunteers'
                                        ? `${item.drives} drives • ${item.hours}h • ${item.wasteKg}kg`
                                        : `${item.drives} drives funded`
                                    }
                                </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="hidden sm:flex items-center gap-1">
                                    {item.badges && Array.isArray(item.badges) && item.badges.slice(0, 5).map((badgeStr, i) => (
                                        <div key={i} className="text-[10px] bg-slate-800 border border-slate-700/50 rounded px-1.5 py-0.5 text-emerald-400">{badgeStr}</div>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-bold ${tab === 'volunteers' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                        {tab === 'volunteers' ? `${(item.points || 0).toLocaleString()} pts` : `₹${((item.amount || 0) / 100).toLocaleString('en-IN')}`}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </motion.div>
                )}

                {/* Badges Section */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-20">
                    <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent mb-16" />
                    <h2 className="text-4xl font-extrabold text-slate-100 mb-10 text-center font-[var(--font-display)]">
                        Earn Badges
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        {AVAILABLE_BADGES.map(badge => (
                            <div key={badge.id} className="glass-card p-5 text-center group">
                                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${badge.name}`} alt="Badge" className="w-14 h-14 mx-auto mb-3 group-hover:scale-110 transition-transform bg-slate-800/50 rounded-xl border border-slate-700/15 p-1" />
                                <h4 className="text-sm font-bold text-slate-100 mb-1">{badge.name}</h4>
                                <p className="text-xs text-slate-400 mb-3 leading-tight">{badge.description}</p>
                                <span className="text-[10px] bg-emerald-500/8 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/10 font-medium inline-block">{badge.requirement}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
