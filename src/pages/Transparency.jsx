import { motion } from 'framer-motion';
import { mockStats, mockDrives, mockExpenses, mockDonations } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import { Eye, DollarSign, Users, Leaf, Shield, CheckCircle2, FileText, Camera, BarChart3, Globe } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

export default function Transparency() {
    const { data: apiData } = useApiData('/api/transparency', null);

    const stats = apiData?.stats?.totalDrives ? apiData.stats : mockStats;
    const donations = apiData?.donations?.length > 0 ? apiData.donations : mockDonations;
    const expenses = apiData?.expenses?.length > 0 ? apiData.expenses : mockExpenses;
    const drives = apiData?.drives?.length > 0 ? apiData.drives : mockDrives;

    const completedDrives = drives.filter(d => d.status === 'completed');
    const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    // Expense by category
    const expenseByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    const categoryColors = {
        Equipment: { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15' },
        Transport: { bar: 'from-blue-500 to-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/15' },
        Refreshments: { bar: 'from-amber-500 to-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/15' },
        Misc: { bar: 'from-purple-500 to-purple-400', text: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/15' },
    };

    return (
        <div className="min-h-screen pt-32 pb-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    
                    <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-emerald-500/8 backdrop-blur-sm text-emerald-400 border border-emerald-500/15 font-medium text-sm mb-6">
                        <Shield size={16} /> 100% Verified & Transparent
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-100 tracking-tight mb-4 font-[var(--font-display)]">
                        Transparency Portal
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Every rupee tracked. Every cleanup fully verified. Trust through radical visibility.
                    </p>
                </motion.div>

                {/* Overview Stats */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
                >
                    {[
                        { icon: DollarSign, label: 'Total Funds', value: `₹${(mockStats.totalFundsRaised / 100000).toFixed(1)}L` },
                        { icon: Leaf, label: 'Waste Cleared', value: `${(mockStats.totalWasteKg / 1000).toFixed(1)}T` },
                        { icon: Users, label: 'Volunteers', value: mockStats.totalVolunteers.toLocaleString() },
                        { icon: Globe, label: 'Events Done', value: mockStats.completedDrives },
                    ].map(({ icon: Icon, label, value }) => (
                        <motion.div key={label} variants={fadeUp} className="glass-card p-6 flex flex-col items-center justify-center text-center group">
                            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Icon size={24} className="text-emerald-400" />
                            </div>
                            <div className="text-3xl font-extrabold text-slate-100 font-[var(--font-display)] mb-1">{value}</div>
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Fund Flow */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card-heavy p-8 md:p-10 mb-8">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700/20 pb-4">
                        <BarChart3 size={28} className="text-emerald-400" />
                        <h2 className="text-2xl font-extrabold text-slate-100 font-[var(--font-display)]">Fund Flow Tracker</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6 text-center">
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Donated</div>
                            <div className="text-3xl font-extrabold text-emerald-400 font-[var(--font-display)]">₹{totalDonations.toLocaleString()}</div>
                        </div>
                        <div className="bg-red-500/3 border border-red-500/8 rounded-xl p-6 text-center">
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Spent</div>
                            <div className="text-3xl font-extrabold text-red-400 font-[var(--font-display)]">₹{totalExpenses.toLocaleString()}</div>
                        </div>
                        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-6 text-center">
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Remaining Balance</div>
                            <div className="text-3xl font-extrabold text-cyan-400 font-[var(--font-display)]">₹{(totalDonations - totalExpenses).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <h3 className="text-lg font-bold text-slate-100 mb-6 font-[var(--font-display)]">Expense Breakdown by Category</h3>
                    <div className="space-y-5">
                        {Object.entries(expenseByCategory).map(([cat, amount]) => {
                            const pct = (amount / totalExpenses) * 100;
                            const colors = categoryColors[cat] || categoryColors.Misc;
                            return (
                                <div key={cat}>
                                    <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                                        <span>{cat}</span>
                                        <span className={colors.text}>₹{amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-800/50 border border-slate-700/15 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${pct}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1 }}
                                            className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* All Verified Expenses Table */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700/20 pb-4">
                        <FileText size={28} className="text-emerald-400" />
                        <h2 className="text-2xl font-extrabold text-slate-100 font-[var(--font-display)]">All Verified Expenses</h2>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-700/15">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="p-4 font-semibold uppercase text-xs text-slate-400 border-b border-slate-700/15">Category</th>
                                    <th className="p-4 font-semibold uppercase text-xs text-slate-400 border-b border-slate-700/15">Description</th>
                                    <th className="p-4 font-semibold uppercase text-xs text-slate-400 border-b border-slate-700/15">Drive</th>
                                    <th className="p-4 font-semibold uppercase text-xs text-slate-400 border-b border-slate-700/15 text-right">Amount</th>
                                    <th className="p-4 font-semibold uppercase text-xs text-slate-400 border-b border-slate-700/15 text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockExpenses.map((exp, idx) => {
                                    const drive = mockDrives.find(d => d.id === exp.driveId);
                                    const colors = categoryColors[exp.category] || categoryColors.Misc;
                                    return (
                                        <tr key={exp.id} className={`${idx !== mockExpenses.length - 1 ? 'border-b border-slate-700/8' : ''} hover:bg-emerald-500/3 transition-colors`}>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-[10px] uppercase font-semibold rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">{exp.description}</td>
                                            <td className="p-4 text-xs text-slate-400 max-w-[200px] truncate">{drive?.title || 'Unknown'}</td>
                                            <td className="p-4 text-right text-sm font-bold text-slate-100">₹{exp.amount.toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                {exp.receipt ? <CheckCircle2 size={20} className="text-emerald-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
