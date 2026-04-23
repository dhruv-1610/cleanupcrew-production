import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiData } from '../hooks/useApiData';
import HlsVideoBg from '../components/HlsVideoBg';
import { MapPin, Users, Leaf, DollarSign, ArrowRight, Sparkles, CheckCircle2, Clock, Zap, TrendingUp, Globe, Award, ChevronRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function StatCard({ icon: Icon, value, label }) {
    return (
        <motion.div variants={fadeUp} className="glass-card p-6 flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon size={26} className="text-emerald-400" />
            </div>
            <div>
                <div className="text-3xl font-extrabold text-slate-100 font-[var(--font-display)]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div className="text-sm font-medium text-slate-400">{label}</div>
            </div>
        </motion.div>
    );
}

function DriveCard({ drive }) {
    const progress = drive.maxVolunteers > 0 ? (drive.currentVolunteers / drive.maxVolunteers) * 100 : 0;
    const fundProgress = drive.fundingGoal > 0 ? (drive.currentFunding / drive.fundingGoal) * 100 : 0;

    return (
        <motion.div variants={fadeUp} className="glass-card hover:translate-y-[-4px] transition-all">
            <div className="p-4 border-b border-slate-700/20 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase py-1 px-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/15">{drive.status}</span>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{drive.severity} severity</span>
            </div>

            <div className="p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-3 font-[var(--font-display)] line-clamp-2 leading-tight">
                    {drive.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-5">
                    <MapPin size={16} className="text-emerald-400/60" />
                    <span className="truncate">{drive.location.address.split(',')[0]}</span>
                </div>

                {/* Progress Blocks */}
                <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-3 mb-3">
                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                        <span>Volunteers</span>
                        <span className="text-emerald-400">{drive.currentVolunteers}/{drive.maxVolunteers}</span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-3 mb-5">
                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                        <span>Funding</span>
                        <span className="text-cyan-400">₹{((drive.currentFunding || 0) / 100000).toFixed(1)}k / ₹{((drive.fundingGoal || 0) / 100000).toFixed(1)}k</span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${fundProgress}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700/20 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                        <Clock size={16} className="text-slate-500" />
                        <span>{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <Link to={`/drives/${drive.id}`} className="px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-lg hover:bg-emerald-500/15 hover:border-emerald-500/25 transition-all">
                        View Info
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function Landing() {
    const { data: apiDrives } = useApiData('/api/drives', [], {
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res?.drives || []);
            return arr.map(d => ({
                ...d,
                id: d._id || d.id,
                location: d.location?.address ? d.location : { address: 'Unknown', ...d.location },
                currentVolunteers: d.currentVolunteers ?? d.requiredRoles?.reduce((s, r) => s + (r.booked || 0), 0) ?? 0,
                maxVolunteers: d.maxVolunteers ?? d.requiredRoles?.reduce((s, r) => s + r.capacity, 0) ?? 0,
                currentFunding: d.currentFunding ?? d.fundingRaised ?? 0,
                fundingGoal: d.fundingGoal ?? 0,
                status: d.status === 'planned' ? 'upcoming' : d.status,
            }));
        }
    });
    const { data: apiStats } = useApiData('/api/transparency', null, {
        pollInterval: 10000,
        transform: (res) => res?.stats || res
    });

    const allDrives = apiDrives || [];
    const stats = apiStats || { totalFundsRaised: 0, totalWasteKg: 0, totalVolunteers: 0, completedDrives: 0 };
    const activeDrives = allDrives.filter(d => d.status === 'active' || d.status === 'upcoming');

    const { data: apiLeaderboard } = useApiData('/api/leaderboard', { volunteers: [], donors: [] }, {
        transform: (res) => {
            const raw = res?.leaderboard || res || {};
            return {
                volunteers: raw?.volunteers || [],
                donors: raw?.donors || [],
            };
        }
    });
    const leaderboard = apiLeaderboard || { volunteers: [], donors: [] };

    return (
        <div className="min-h-screen">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden flex items-center justify-center" style={{ height: '100vh' }}>
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                >
                    <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4" type="video/mp4" />
                </video>
                {/* Dark gradient overlay */}
                <div className="absolute inset-0" style={{ zIndex: 1, background: 'linear-gradient(to bottom, rgba(5,13,26,0.5) 0%, rgba(10,22,40,0.7) 50%, rgba(5,13,26,0.9) 100%)' }} />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ zIndex: 2 }}>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-sm text-emerald-400 border border-emerald-500/20 font-semibold text-sm mb-6">
                        <Sparkles size={16} /> {stats.completedDrives || 0} Drives Completed Nationwide
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl sm:text-7xl lg:text-[90px] font-extrabold leading-none tracking-tight mb-6 font-[var(--font-display)]">
                        <span className="text-white">Clean. Track.</span><br />
                        <span className="gradient-text">Impact.</span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-8">
                        Gamified, transparent community cleanups. We show you exactly where every rupee and hour goes.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
                        <Link to="/drives" className="btn-primary text-lg px-8 py-4">
                            <Zap size={20} /> Join a Drive
                        </Link>
                        <Link to="/map" className="btn-secondary text-lg px-8 py-4">
                            Explore Map
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* LOWER SECTIONS WRAPPER */}
            <div className="relative">
                {/* Background Video for lower sections */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <HlsVideoBg 
                        src="https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8" 
                        className="absolute w-full h-full object-cover opacity-60"
                    />
                </div>
                
                <div className="relative z-10">
                    {/* IMPACT STATS */}
                    <section className="py-20 relative">
                {/* Subtle section separator */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Leaf} value={`${(stats.totalWasteKg || 0).toLocaleString()}kg`} label="Waste Collected" />
                        <StatCard icon={Users} value={(stats.totalVolunteers || 0).toLocaleString()} label="Volunteers" />
                        <StatCard icon={DollarSign} value={`₹${((stats.totalFundsRaised || 0) / 100).toLocaleString('en-IN')}`} label="Funds Raised" />
                        <StatCard icon={Globe} value={(stats.completedDrives || 0).toLocaleString()} label="Locations Cleaned" />
                    </motion.div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 mb-4 font-[var(--font-display)]">How We Do It</h2>
                        <p className="text-lg text-slate-400">Verified steps to guaranteed impact.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Report It', desc: 'Find trash? Pin it on the map with severity details.', icon: MapPin },
                            { step: '2', title: 'Fund It', desc: 'Donors pitch in to buy tools and refreshments.', icon: DollarSign },
                            { step: '3', title: 'Clean It', desc: 'Volunteers scan QR to join and clear the spot!', icon: Trash2 },
                        ].map(({ step, title, desc, icon: Icon }) => (
                            <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8 text-center relative mt-8">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-lg text-emerald-400 border border-emerald-500/25 rounded-xl flex items-center justify-center font-bold text-lg font-[var(--font-display)]">
                                    {step}
                                </div>
                                <Icon size={36} className="mx-auto mb-4 text-emerald-400/60 mt-4" />
                                <h3 className="text-xl font-bold text-slate-100 mb-2 font-[var(--font-display)]">{title}</h3>
                                <p className="text-sm text-slate-400">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ACTIVE DRIVES */}
            <section className="py-20 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                        <h2 className="text-4xl font-extrabold text-slate-100 font-[var(--font-display)]">Active Drives</h2>
                        <Link to="/drives" className="btn-primary mt-4 md:mt-0">View All <ArrowRight size={16} /></Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeDrives.slice(0, 3).map(drive => (
                            <DriveCard key={drive.id} drive={drive} />
                        ))}
                    </div>
                </div>
            </section>

            {/* MINI LEADERBOARD */}
            <section className="py-20 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 mb-4 font-[var(--font-display)]">Top Heroes</h2>
                        <Link to="/leaderboard" className="btn-secondary">See Full Leaderboard</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-700/20 pb-3 font-[var(--font-display)]"><Award className="text-emerald-400" /> Top Volunteers</h3>
                            <div className="space-y-3">
                                {leaderboard.volunteers.slice(0, 3).map((v, i) => (
                                    <div key={v.id || i} className="flex items-center gap-4 p-3 bg-slate-800/30 border border-slate-700/15 rounded-xl hover:-translate-y-0.5 transition-transform">
                                        <div className="text-lg font-bold text-slate-400 w-6 text-center">{i + 1}</div>
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${v.name}`} alt={v.name} className="w-10 h-10 bg-slate-800 rounded-lg" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-200 leading-tight text-sm">{v.name}</div>
                                            <div className="text-[10px] font-medium text-slate-500 uppercase">{v.hoursVolunteered || 0} hours logged</div>
                                        </div>
                                        <div className="font-bold text-lg text-emerald-400">{v.points}</div>
                                    </div>
                                ))}
                                {leaderboard.volunteers.length === 0 && <p className="text-slate-500 text-sm">No top volunteers yet.</p>}
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-700/20 pb-3 font-[var(--font-display)]"><DollarSign className="text-cyan-400" /> Top Donors</h3>
                            <div className="space-y-3">
                                {leaderboard.donors.slice(0, 3).map((d, i) => (
                                    <div key={d.id || i} className="flex items-center gap-4 p-3 bg-slate-800/30 border border-slate-700/15 rounded-xl hover:-translate-y-0.5 transition-transform">
                                        <div className="text-lg font-bold text-slate-400 w-6 text-center">{i + 1}</div>
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${d.name}`} alt={d.name} className="w-10 h-10 bg-slate-800 rounded-lg" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-200 leading-tight text-sm">{d.name}</div>
                                            <div className="text-[10px] font-medium text-slate-500 uppercase">{d.donationCount || 1} drives funded</div>
                                        </div>
                                        <div className="font-bold text-lg text-cyan-400">₹{((d.totalDonated || 0) / 100).toLocaleString()}</div>
                                    </div>
                                ))}
                                {leaderboard.donors.length === 0 && <p className="text-slate-500 text-sm">No top donors yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</div>
    );
}

const Trash2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
