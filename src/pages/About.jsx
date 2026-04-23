import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MapPin, Users, DollarSign, Shield, BarChart3, Map, QrCode,
    Eye, Award, Camera, Truck, Coffee, Wrench, ArrowRight,
    CheckCircle2, Leaf, Globe, Heart, Zap, Target
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const modules = [
    { icon: Camera, title: 'Smart Spot Reporting', desc: 'Report dirty spots with photo, GPS location, severity. Admin verifies → drives get created.', color: 'from-red-500 to-orange-500' },
    { icon: Leaf, title: 'Drive Management', desc: 'Admin creates drives with title, date, funding goal, and role slots (Cleaner, Coordinator, Photographer, Logistics).', color: 'from-emerald-500 to-green-500' },
    { icon: QrCode, title: 'Slot Booking + QR', desc: 'No overbooking. One role per user. Waitlist if full. QR-based attendance with timestamps.', color: 'from-blue-500 to-cyan-500' },
    { icon: DollarSign, title: 'Donation System', desc: 'Stripe-powered, drive-specific donations. Live progress bars. Full expense breakup with proof uploads.', color: 'from-amber-500 to-yellow-500' },
    { icon: BarChart3, title: 'Impact Measurement', desc: 'Post-event metrics: waste collected (kg), area cleaned, volunteer count, before/after photos.', color: 'from-purple-500 to-violet-500' },
    { icon: Map, title: 'Interactive Map', desc: 'Status-coded markers: Reported (red), Verified (amber), Drive Created (blue), Cleaned (green).', color: 'from-teal-500 to-emerald-500' },
    { icon: Shield, title: 'Security Layer', desc: 'JWT auth, email verification, role-based access, duplicate account blocking, admin approval flow.', color: 'from-slate-500 to-zinc-500' },
    { icon: Eye, title: 'Transparency Portal', desc: 'Public can see all money collected, verified expenses, event photos, and attendance records.', color: 'from-cyan-500 to-sky-500' },
    { icon: Award, title: 'Gamification', desc: 'Leaderboards (Top Donors + Volunteers), badges, downloadable certificates, progress goals.', color: 'from-pink-500 to-rose-500' },
];

const journey = [
    { step: '01', title: 'Spot Reported', desc: 'User reports a dirty location with photo & GPS' },
    { step: '02', title: 'Admin Verifies', desc: 'Admin reviews and approves the report' },
    { step: '03', title: 'Drive Created', desc: 'Cleanup drive is organized at that location' },
    { step: '04', title: 'Volunteers Book', desc: 'Users pick roles and book volunteer slots' },
    { step: '05', title: 'Donors Fund', desc: 'Drive-specific donations flow in via Stripe' },
    { step: '06', title: 'Event Day', desc: 'QR attendance, cleanup happens on ground' },
    { step: '07', title: 'Proof Uploaded', desc: 'Admin uploads photos, expenses, metrics' },
    { step: '08', title: 'Impact Visible', desc: 'Leaderboards update, transparency portal shows all' },
];

const techStack = [
    { category: 'Frontend', items: ['React', 'Tailwind CSS', 'Framer Motion', 'Leaflet Maps'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'JWT Auth', 'REST APIs'] },
    { category: 'Database', items: ['MongoDB', 'Mongoose ODM'] },
    { category: 'Payments', items: ['Stripe Integration'] },
];

export default function About() {
    return (
        <div className="min-h-screen pt-20 pb-24 overflow-hidden">
            {/* Fixed Background Video */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-bottom opacity-40"
                >
                    <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_145725_08886141-ed95-4a8e-8d6d-b75eaadce638.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Hero Section ─────────────────────────── */}
                <motion.section
                    className="text-center mb-24"
                    initial="hidden" animate="visible"
                >
                    <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Globe size={14} /> About The Project
                    </motion.div>
                    <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 leading-tight mb-6 font-[var(--font-display)]">
                        From Random Goodwill<br />
                        <span className="gradient-text">To Structured Social Action</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
                        CleanupCrew is a transparency-focused platform that organizes locality-based cleanup drives
                        by connecting <span className="text-emerald-400 font-semibold">volunteers</span>, <span className="text-cyan-400 font-semibold">donors</span>,
                        and <span className="text-purple-400 font-semibold">organizers</span> — with full tracking, verification, and proof of impact.
                    </motion.p>
                    <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4 flex-wrap">
                        <Link to="/drives" className="btn-primary flex items-center gap-2">
                            Explore Drives <ArrowRight size={16} />
                        </Link>
                        <Link to="/map" className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800/80 hover:text-slate-100 transition-all">
                            View Map
                        </Link>
                    </motion.div>
                </motion.section>

                {/* ── Problem Section ─────────────────────── */}
                <motion.section
                    className="mb-24"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-extrabold text-slate-100 text-center mb-4 font-[var(--font-display)]">
                        The <span className="gradient-text">Problem</span> We Solve
                    </motion.h2>
                    <motion.p variants={fadeUp} custom={1} className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
                        Cities suffer from illegal dumping, plastic waste zones, and dirty public spaces — but citizens have no way to organize.
                    </motion.p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { icon: Target, label: 'No centralized place to join drives', num: '01' },
                            { icon: Heart, label: 'No trust in where donations go', num: '02' },
                            { icon: CheckCircle2, label: 'No proof of real work done', num: '03' },
                            { icon: Users, label: 'No organized volunteer management', num: '04' },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i + 2} className="glass-card p-6 text-center group hover:border-emerald-500/20 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/15 transition-all">
                                    <item.icon size={20} className="text-red-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">{item.num}</div>
                                <p className="text-sm text-slate-300 font-medium">{item.label}</p>
                            </motion.div>
                        ))}
                    </div>
                    <motion.div variants={fadeUp} custom={6} className="mt-8 text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/15">
                            <span className="text-sm text-slate-300 font-medium">CleanupCrew bridges:</span>
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="text-red-400">Problem</span>
                                <ArrowRight size={12} className="text-slate-500" />
                                <span className="text-blue-400">People</span>
                                <ArrowRight size={12} className="text-slate-500" />
                                <span className="text-amber-400">Money</span>
                                <ArrowRight size={12} className="text-slate-500" />
                                <span className="text-purple-400">Action</span>
                                <ArrowRight size={12} className="text-slate-500" />
                                <span className="text-emerald-400">Proof</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* ── 9 System Modules ────────────────────── */}
                <motion.section
                    className="mb-24"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-extrabold text-slate-100 text-center mb-4 font-[var(--font-display)]">
                        9 Core <span className="gradient-text">Modules</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} custom={1} className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
                        End-to-end system covering reporting, organizing, funding, verification, and impact measurement.
                    </motion.p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {modules.map((mod, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                custom={i + 2}
                                className="glass-card p-6 group hover:border-emerald-500/20 transition-all duration-300"
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                                    <mod.icon size={20} className="text-white" />
                                </div>
                                <h3 className="text-base font-bold text-slate-100 mb-2">{mod.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── User Journey ─────────────────────────── */}
                <motion.section
                    className="mb-24"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-extrabold text-slate-100 text-center mb-4 font-[var(--font-display)]">
                        Complete <span className="gradient-text">User Journey</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} custom={1} className="text-center text-slate-400 mb-12 max-w-xl mx-auto">
                        From dirty spot to measurable impact — the end-to-end transparency loop.
                    </motion.p>
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/30 via-cyan-500/20 to-transparent" />
                        <div className="space-y-8">
                            {journey.map((j, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    custom={i + 2}
                                    className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    <div className="hidden md:block flex-1" />
                                    <div className="relative z-10 w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-extrabold flex-shrink-0">
                                        {j.step}
                                    </div>
                                    <div className="flex-1 glass-card p-5">
                                        <h4 className="text-sm font-bold text-slate-100 mb-1">{j.title}</h4>
                                        <p className="text-xs text-slate-400">{j.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* ── User Roles ───────────────────────────── */}
                <motion.section
                    className="mb-24"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-extrabold text-slate-100 text-center mb-12 font-[var(--font-display)]">
                        User <span className="gradient-text">Roles</span>
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { title: 'Public User', desc: 'View drives, explore map, see reports, view leaderboards, read impact stats.', icon: Eye, accent: 'emerald' },
                            { title: 'Registered User', desc: 'Volunteer for drives, donate, track activity, slot booking, QR attendance, rewards & badges.', icon: Users, accent: 'cyan' },
                            { title: 'Admin', desc: 'Create drives, verify reports, manage attendance, upload expenses, moderate map, user control.', icon: Shield, accent: 'purple' },
                        ].map((role, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i + 1} className="glass-card p-6 text-center">
                                <div className={`w-14 h-14 rounded-2xl bg-${role.accent}-500/10 border border-${role.accent}-500/15 flex items-center justify-center mx-auto mb-4`}>
                                    <role.icon size={24} className={`text-${role.accent}-400`} />
                                </div>
                                <h3 className="text-base font-bold text-slate-100 mb-2">{role.title}</h3>
                                <p className="text-sm text-slate-400">{role.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Tech Stack ───────────────────────────── */}
                <motion.section
                    className="mb-24"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-extrabold text-slate-100 text-center mb-12 font-[var(--font-display)]">
                        Technology <span className="gradient-text">Stack</span>
                    </motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {techStack.map((cat, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i + 1} className="glass-card p-5">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">{cat.category}</h3>
                                <ul className="space-y-2">
                                    {cat.items.map((item, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Viva-Ready / CTA ─────────────────────── */}
                <motion.section
                    className="text-center"
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                >
                    <motion.div variants={fadeUp} custom={0} className="glass-card-heavy p-10 md:p-14 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                            <Zap size={12} /> Project Summary
                        </div>
                        <blockquote className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium italic mb-8">
                            "CleanupCrew is a transparency-focused platform that organizes locality-based cleanup
                            drives by connecting volunteers and donors. It provides slot booking with QR attendance,
                            drive-specific funding with expense tracking, map-based reporting, and measurable
                            impact metrics to convert community goodwill into structured real-world cleanliness action."
                        </blockquote>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link to="/register" className="btn-primary flex items-center gap-2">
                                Join CleanupCrew <ArrowRight size={16} />
                            </Link>
                            <Link to="/transparency" className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800/80 transition-all">
                                View Transparency
                            </Link>
                        </div>
                    </motion.div>
                </motion.section>

            </div>
        </div>
    );
}
