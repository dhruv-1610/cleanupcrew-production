import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockStats, mockDrives, mockLeaderboard } from '../data/mockData';
import { MapPin, Users, Leaf, DollarSign, ArrowRight, Sparkles, CheckCircle2, Clock, Zap, TrendingUp, Globe, Award, ChevronRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function StatCard({ icon: Icon, value, label }) {
    return (
        <motion.div variants={fadeUp} className="glass-card p-6 flex items-center gap-4 group">
            <div className="w-16 h-16 rounded-xl border-2 border-[#005202] bg-white flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                <Icon size={28} className="text-[#008303]" />
            </div>
            <div>
                <div className="text-3xl font-extrabold text-[#008303] font-[var(--font-display)]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div className="text-sm font-bold text-[#005202] uppercase">{label}</div>
            </div>
        </motion.div>
    );
}

function DriveCard({ drive }) {
    const progress = (drive.currentVolunteers / drive.maxVolunteers) * 100;
    const fundProgress = (drive.currentFunding / drive.fundingGoal) * 100;

    return (
        <motion.div variants={fadeUp} className="glass-card hover:translate-y-[-4px] transition-transform">
            <div className="border-b-4 border-[#005202] p-4 bg-[#008303] flex justify-between items-center force-white">
                <span className="text-xs font-bold uppercase py-1 px-3 bg-white text-[#008303] rounded-full border-2 border-[#005202]">{drive.status}</span>
                <span className="text-xs font-black uppercase tracking-wider">{drive.severity} SEVERITY</span>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-[#008303] mb-4 font-[var(--font-display)] line-clamp-2 leading-tight">
                    {drive.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-[#006902] font-semibold mb-6">
                    <MapPin size={16} />
                    <span className="truncate">{drive.location.address.split(',')[0]}</span>
                </div>

                {/* Progress Blocks */}
                <div className="bg-[#f0fdf4] border-2 border-[#005202] rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-xs font-bold text-[#005202] mb-1">
                        <span>VOLUNTEERS</span>
                        <span>{drive.currentVolunteers}/{drive.maxVolunteers}</span>
                    </div>
                    <div className="h-3 bg-white border-2 border-[#005202] rounded-full overflow-hidden">
                        <div className="h-full bg-[#008303] border-r-2 border-[#005202]" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="bg-[#f0fdf4] border-2 border-[#005202] rounded-lg p-3 mb-6">
                    <div className="flex justify-between text-xs font-bold text-[#005202] mb-1">
                        <span>FUNDING</span>
                        <span>₹{(drive.currentFunding / 1000).toFixed(0)}k / ₹{(drive.fundingGoal / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-3 bg-white border-2 border-[#005202] rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 border-r-2 border-[#005202]" style={{ width: `${fundProgress}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t-2 border-dashed border-[#005202]/30 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#005202]">
                        <Clock size={16} />
                        <span>{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <Link to={`/drives/${drive.id}`} className="px-4 py-2 bg-[#008303] force-white font-bold rounded-lg border-2 border-[#005202] hover:-translate-y-1 hover:shadow-[2px_2px_0px_#005202] transition-all text-xs">
                        VIEW INFO
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function Landing() {
    const activeDrives = mockDrives.filter(d => d.status === 'active' || d.status === 'upcoming');

    return (
        <div className="min-h-screen">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden border-b-8 border-white/20 flex items-center justify-center" style={{ height: '100vh' }}>
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
                {/* Subtle dark tint for text readability */}
                <div className="absolute inset-0" style={{ zIndex: 1, background: 'rgba(0,0,0,0.35)' }} />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ zIndex: 2 }}>

                    <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl sm:text-7xl lg:text-[100px] font-black leading-none tracking-tight mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                        CLEAN. TRACK.<br />IMPACT.
                    </motion.h1>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white text-[#008303] border-4 border-[#005202] font-extrabold text-sm mb-4 shadow-[4px_4px_0px_#005202]">
                        <Sparkles size={16} /> {mockStats.completedDrives} DRIVES COMPLETED NATIONWIDE
                    </motion.div>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg sm:text-xl text-white font-semibold max-w-2xl mx-auto mb-6 drop-shadow-md">
                        Gamified, transparent community cleanups. We show you exactly where every rupee and hour goes.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
                        <Link to="/drives" className="btn-primary text-lg px-8 py-4">
                            <Zap size={20} /> JOIN A DRIVE
                        </Link>
                        <Link to="/map" className="btn-secondary text-lg px-8 py-4 bg-white text-[#008303]">
                            EXPLORE MAP
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* IMPACT STATS */}
            <section className="py-16 bg-white border-b-8 border-[#005202]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Leaf} value={`${(mockStats.totalWasteKg / 1000).toFixed(1)}T`} label="Waste Collected" />
                        <StatCard icon={Users} value={mockStats.totalVolunteers} label="Volunteers" />
                        <StatCard icon={DollarSign} value={`₹${(mockStats.totalFundsRaised / 100000).toFixed(1)}L`} label="Funds Raised" />
                        <StatCard icon={Globe} value={mockStats.completedDrives} label="Locations Cleaned" />
                    </motion.div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl sm:text-6xl font-black text-white mb-4 drop-shadow-[3px_3px_0px_#005202]">HOW WE DO IT</h2>
                        <p className="text-xl text-white/90 font-semibold">Verified steps to guaranteed impact.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'REPORT IT', desc: 'Find trash? Pin it on the map with severity details.', icon: MapPin },
                            { step: '2', title: 'FUND IT', desc: 'Donors pitch in to buy tools and refreshments.', icon: DollarSign },
                            { step: '3', title: 'CLEAN IT', desc: 'Volunteers scan QR to join and clear the spot!', icon: Trash2 },
                        ].map(({ step, title, desc, icon: Icon }) => (
                            <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8 text-center relative mt-8">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#008303] text-white border-4 border-[#005202] rounded-xl flex items-center justify-center font-black text-xl font-[var(--font-display)]">
                                    {step}
                                </div>
                                <Icon size={40} className="mx-auto mb-4 text-[#005202] mt-4" />
                                <h3 className="text-2xl font-black text-[#008303] mb-2 font-[var(--font-display)]">{title}</h3>
                                <p className="text-sm font-bold text-[#006902]">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ACTIVE DRIVES */}
            <section className="py-20 bg-white border-y-8 border-[#005202]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b-4 border-[#008303] pb-4">
                        <h2 className="text-5xl font-black text-[#008303] font-[var(--font-display)]">ACTIVE DRIVES</h2>
                        <Link to="/drives" className="btn-primary mt-4 md:mt-0">VIEW ALL <ArrowRight size={16} /></Link>
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl sm:text-6xl font-black text-white mb-4 drop-shadow-[3px_3px_0px_#005202]">TOP HEROES</h2>
                        <Link to="/leaderboard" className="btn-secondary bg-white text-[#008303]">SEE FULL LEADERBOARD</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="glass-card p-8">
                            <h3 className="text-2xl font-black text-[#008303] mb-6 flex items-center gap-2 border-b-4 border-[#008303] pb-2 font-[var(--font-display)]"><Award /> TOP VOLUNTEERS</h3>
                            <div className="space-y-4">
                                {mockLeaderboard.volunteers.slice(0, 3).map((v) => (
                                    <div key={v.rank} className="flex items-center gap-4 p-3 bg-[#f0fdf4] border-2 border-[#005202] rounded-xl hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#005202]">
                                        <div className="text-xl font-black text-[#005202] w-6 text-center">{v.rank}</div>
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${v.name}`} alt={v.name} className="w-12 h-12 bg-white rounded-lg border-2 border-[#005202]" />
                                        <div className="flex-1">
                                            <div className="font-bold text-[#008303] leading-tight">{v.name}</div>
                                            <div className="text-[10px] font-extrabold text-[#005202] uppercase">{v.hours} HOURS LOGGED</div>
                                        </div>
                                        <div className="font-black text-xl text-[#008303]">{v.points}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <h3 className="text-2xl font-black text-[#008303] mb-6 flex items-center gap-2 border-b-4 border-[#008303] pb-2 font-[var(--font-display)]"><DollarSign /> TOP DONORS</h3>
                            <div className="space-y-4">
                                {mockLeaderboard.donors.slice(0, 3).map((d) => (
                                    <div key={d.rank} className="flex items-center gap-4 p-3 bg-[#f0fdf4] border-2 border-[#005202] rounded-xl hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#005202]">
                                        <div className="text-xl font-black text-[#005202] w-6 text-center">{d.rank}</div>
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${d.name}`} alt={d.name} className="w-12 h-12 bg-white rounded-lg border-2 border-[#005202]" />
                                        <div className="flex-1">
                                            <div className="font-bold text-[#008303] leading-tight">{d.name}</div>
                                            <div className="text-[10px] font-extrabold text-[#005202] uppercase">{d.drives} DRIVES FUNDED</div>
                                        </div>
                                        <div className="font-black text-xl text-[#008303]">₹{(d.amount / 1000).toFixed(0)}k</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const Trash2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
