import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockLeaderboard, mockBadges } from '../data/mockData';
import { Award, Trophy, DollarSign, TrendingUp, Crown, Medal, Star } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.5 } }),
};

export default function Leaderboard() {
    const [tab, setTab] = useState('volunteers');

    const rankStyle = (rank) => {
        if (rank === 1) return 'bg-[#fff] border-[6px] border-yellow-400 shadow-[6px_6px_0px_#cc9900] scale-[1.02] z-10';
        if (rank === 2) return 'bg-[#fff] border-4 border-[#b0bec5] shadow-[4px_4px_0px_#78909c]';
        if (rank === 3) return 'bg-[#fff] border-4 border-orange-400 shadow-[4px_4px_0px_#b26500]';
        return 'bg-white border-2 border-[#005202] shadow-[2px_2px_0px_#005202]';
    };

    const rankIcon = (rank) => {
        if (rank === 1) return <Crown size={32} className="text-yellow-400 drop-shadow-md" />;
        if (rank === 2) return <Medal size={28} className="text-[#b0bec5] drop-shadow-md" />;
        if (rank === 3) return <Medal size={28} className="text-orange-400 drop-shadow-md" />;
        return <span className="text-2xl font-black text-[#008303] block w-8 text-center">{rank}</span>;
    };

    return (
        <div className="min-h-screen pt-32 pb-24 border-b-8 border-[#005202]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <img src="/images/logo-light.png" alt="Logo" className="h-20 w-auto mx-auto mb-6 drop-shadow-lg" />
                    <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-3 drop-shadow-[4px_4px_0px_#005202]">
                        LEADERBOARD
                    </h1>
                    <p className="text-xl font-bold text-white max-w-lg mx-auto">
                        The heroes making our communities cleaner
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-12">
                    <div className="flex gap-2 p-2 bg-white border-4 border-[#005202] rounded-2xl shadow-[4px_4px_0px_#005202]">
                        <button
                            onClick={() => setTab('volunteers')}
                            className={`flex items-center gap-2 px-8 py-3 text-lg font-bold rounded-lg transition-all ${tab === 'volunteers' ? 'bg-[#008303] force-white border-2 border-[#005202] shadow-[2px_2px_0px_#005202]' : 'text-[#008303] hover:bg-[#f0fdf4]'
                                }`}
                        >
                            <Trophy size={20} /> VOLUNTEERS
                        </button>
                        <button
                            onClick={() => setTab('donors')}
                            className={`flex items-center gap-2 px-8 py-3 text-lg font-bold rounded-lg transition-all ${tab === 'donors' ? 'bg-[#008303] force-white border-2 border-[#005202] shadow-[2px_2px_0px_#005202]' : 'text-[#008303] hover:bg-[#f0fdf4]'
                                }`}
                        >
                            <DollarSign size={20} /> DONORS
                        </button>
                    </div>
                </motion.div>

                {/* Top 3 Podium */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-16 items-end h-80"
                >
                    {(tab === 'volunteers' ? [mockLeaderboard.volunteers[1], mockLeaderboard.volunteers[0], mockLeaderboard.volunteers[2]] : [mockLeaderboard.donors[1], mockLeaderboard.donors[0], mockLeaderboard.donors[2]]).map((u, idx) => {
                        const heights = ['h-32', 'h-48', 'h-24'];
                        const positions = [2, 1, 3];
                        const pos = positions[idx];
                        const val = tab === 'volunteers' ? u.points.toLocaleString() + ' pts' : '₹' + (u.amount / 1000).toFixed(0) + 'k';

                        return (
                            <motion.div key={u.rank} variants={fadeUp} className="flex flex-col items-center">
                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`} alt={u.name} className={`bg-white rounded-xl mb-3 object-cover border-4 border-[#005202] shadow-[4px_4px_0px_#005202] ${pos === 1 ? 'w-24 h-24' : 'w-20 h-20'}`} />
                                <div className="text-sm font-black text-white text-center mb-1 max-w-full px-1">{u.name.split(' ')[0]}</div>
                                <div className="text-xs font-bold text-white mb-2 bg-[#005202] px-2 py-1 rounded-lg">{val}</div>

                                <div className={`w-full ${heights[idx]} bg-white border-x-4 border-t-4 border-[#005202] flex items-start pt-4 justify-center rounded-t-xl relative overflow-hidden shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)]`}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        {rankIcon(pos)}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Full list */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                    className="space-y-4 max-w-4xl mx-auto"
                >
                    {(tab === 'volunteers' ? mockLeaderboard.volunteers : mockLeaderboard.donors).map((item) => (
                        <motion.div
                            key={item.rank}
                            variants={fadeUp}
                            className={`flex items-center gap-6 p-4 rounded-2xl hover:-translate-y-1 transition-transform relative ${rankStyle(item.rank)}`}
                        >
                            <div className="w-12 flex-shrink-0 flex items-center justify-center">
                                {rankIcon(item.rank)}
                            </div>
                            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.name}`} className="w-14 h-14 bg-[#f0fdf4] border-2 border-[#005202] rounded-xl flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                                <div className="text-xl font-bold text-[#008303] truncate font-[var(--font-display)]">{item.name}</div>
                                <div className="text-sm font-bold text-[#005202] uppercase">
                                    {tab === 'volunteers'
                                        ? `${item.drives} drives • ${item.hours}h • ${item.wasteKg}kg`
                                        : `${item.drives} drives funded`
                                    }
                                </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="hidden sm:flex items-center gap-1">
                                    {mockBadges.slice(0, Math.min(item.badges, 5)).map((badge, i) => (
                                        <img key={i} src={`https://api.dicebear.com/7.x/bottts/svg?seed=${badge.name}`} alt={badge.name} title={badge.name} className="w-6 h-6 rounded bg-[#f0fdf4] border border-[#005202] drop-shadow-[2px_2px_0px_#005202]" />
                                    ))}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-[#008303]">
                                        {tab === 'volunteers' ? `${item.points.toLocaleString()} pts` : `₹${(item.amount / 1000).toFixed(0)}k`}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Badges Section */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-24">
                    <h2 className="text-5xl font-black text-white mb-12 text-center tracking-tight drop-shadow-[4px_4px_0px_#005202]">
                        EARN BADGES
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {mockBadges.map(badge => (
                            <div key={badge.id} className="glass-card p-6 text-center group hover:-translate-y-2 transition-transform">
                                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${badge.name}`} alt="Badge" className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform bg-[#f0fdf4] rounded-lg border-2 border-[#005202] p-1 shadow-[2px_2px_0px_#005202]" />
                                <h4 className="text-lg font-black text-[#008303] mb-2 uppercase">{badge.name}</h4>
                                <p className="text-xs font-bold text-[#005202] mb-3 leading-tight">{badge.description}</p>
                                <span className="text-[10px] bg-[#008303] force-white px-3 py-1 rounded-lg border-2 border-[#005202] font-black uppercase inline-block">{badge.requirement}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
