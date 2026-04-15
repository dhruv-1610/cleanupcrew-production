import { motion } from 'framer-motion';
import { mockStats, mockDrives, mockExpenses, mockDonations } from '../data/mockData';
import { Eye, DollarSign, Users, Leaf, Shield, CheckCircle2, FileText, Camera, BarChart3, Globe } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

export default function Transparency() {
    const completedDrives = mockDrives.filter(d => d.status === 'completed');
    const totalDonations = mockDonations.reduce((s, d) => s + d.amount, 0);
    const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);

    // Expense by category
    const expenseByCategory = mockExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    const categoryColors = {
        Equipment: '#008303',
        Transport: '#1d4ed8',
        Refreshments: '#b45309',
        Misc: '#6d28d9',
    };

    return (
        <div className="min-h-screen pt-32 pb-24 border-b-8 border-[#005202]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-[#008303] border-4 border-[#005202] font-extrabold text-sm mb-8 shadow-[4px_4px_0px_#005202] uppercase tracking-wide">
                        <Shield size={16} /> 100% VERIFIED & TRANSPARENT
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-[4px_4px_0px_#005202] font-[var(--font-display)]">
                        TRANSPARENCY PORTAL
                    </h1>
                    <p className="text-xl font-bold text-white max-w-2xl mx-auto">
                        Every rupee tracked. Every cleanup fully verified. Trust through radical visibility.
                    </p>
                </motion.div>

                {/* Overview Stats (The Four Boxes Icons) */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
                >
                    {[
                        { icon: DollarSign, label: 'TOTAL FUNDS', value: `₹${(mockStats.totalFundsRaised / 100000).toFixed(1)}L` },
                        { icon: Leaf, label: 'WASTE CLEARED', value: `${(mockStats.totalWasteKg / 1000).toFixed(1)}T` },
                        { icon: Users, label: 'VOLUNTEERS', value: mockStats.totalVolunteers.toLocaleString() },
                        { icon: Globe, label: 'EVENTS DONE', value: mockStats.completedDrives },
                    ].map(({ icon: Icon, label, value }) => (
                        <motion.div key={label} variants={fadeUp} className="glass-card p-8 flex flex-col items-center justify-center text-center hover:translate-y-[-4px]">
                            {/* FIX: Icon background correctly mapped to white-on-green style */}
                            <div className="w-16 h-16 mb-4 rounded-2xl bg-[#008303] border-4 border-[#005202] shadow-[4px_4px_0px_#005202] flex items-center justify-center -mt-12 relative z-10 transform -rotate-3">
                                <Icon size={32} className="text-white drop-shadow-md" />
                            </div>
                            <div className="text-4xl font-extrabold text-[#008303] font-[var(--font-display)] mb-2 mt-2">{value}</div>
                            <div className="text-sm font-black text-[#005202] uppercase tracking-widest">{label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Fund Flow */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card-heavy p-8 md:p-12 mb-16">
                    <div className="flex items-center gap-3 mb-10 border-b-4 border-[#008303] pb-4">
                        <BarChart3 size={32} className="text-[#008303]" />
                        <h2 className="text-3xl font-black text-[#008303] font-[var(--font-display)] uppercase">FUND FLOW TRACKER</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-[#f0fdf4] border-4 border-[#005202] rounded-xl p-8 text-center shadow-[4px_4px_0px_#005202]">
                            <div className="text-sm font-black text-[#005202] uppercase tracking-widest mb-3">TOTAL DONATED</div>
                            <div className="text-4xl font-black text-[#008303] font-[var(--font-display)]">₹{totalDonations.toLocaleString()}</div>
                        </div>
                        <div className="bg-white border-4 border-[#005202] rounded-xl p-8 text-center shadow-[4px_4px_0px_#005202]">
                            <div className="text-sm font-black text-[#005202] uppercase tracking-widest mb-3">TOTAL SPENT</div>
                            <div className="text-4xl font-black text-red-600 font-[var(--font-display)]">₹{totalExpenses.toLocaleString()}</div>
                        </div>
                        <div className="bg-yellow-100 border-4 border-[#005202] rounded-xl p-8 text-center shadow-[4px_4px_0px_#005202]">
                            <div className="text-sm font-black text-[#005202] uppercase tracking-widest mb-3">REMAINING BALANCE</div>
                            <div className="text-4xl font-black text-yellow-600 font-[var(--font-display)]">₹{(totalDonations - totalExpenses).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Expense Breakdown Chart */}
                    <h3 className="text-xl font-black text-[#008303] mb-6 uppercase tracking-wider">EXPENSE BREAKDOWN BY CATEGORY</h3>
                    <div className="space-y-6">
                        {Object.entries(expenseByCategory).map(([cat, amount]) => {
                            const pct = (amount / totalExpenses) * 100;
                            return (
                                <div key={cat}>
                                    <div className="flex justify-between text-sm font-black text-[#005202] mb-2 uppercase">
                                        <span>{cat}</span>
                                        <span>₹{amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-6 bg-white border-4 border-[#005202] rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${pct}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1 }}
                                            className="h-full border-r-4 border-[#005202]"
                                            style={{ background: categoryColors[cat] || '#008303' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* All Verified Expenses Table */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8 md:p-12 mb-16">
                    <div className="flex items-center gap-3 mb-10 border-b-4 border-[#008303] pb-4">
                        <FileText size={32} className="text-[#008303]" />
                        <h2 className="text-3xl font-black text-[#008303] font-[var(--font-display)] uppercase">ALL VERIFIED EXPENSES</h2>
                    </div>

                    <div className="overflow-x-auto border-4 border-[#005202] rounded-xl">
                        <table className="w-full text-left bg-white">
                            <thead className="bg-[#008303] text-white">
                                <tr>
                                    <th className="p-4 font-black uppercase text-sm border-b-4 border-r-4 border-[#005202]">CATEGORY</th>
                                    <th className="p-4 font-black uppercase text-sm border-b-4 border-r-4 border-[#005202]">DESCRIPTION</th>
                                    <th className="p-4 font-black uppercase text-sm border-b-4 border-r-4 border-[#005202]">DRIVE</th>
                                    <th className="p-4 font-black uppercase text-sm border-b-4 border-r-4 border-[#005202] text-right">AMOUNT</th>
                                    <th className="p-4 font-black uppercase text-sm border-b-4 border-[#005202] text-center">RECEIPT</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-[#005202]">
                                {mockExpenses.map((exp, idx) => {
                                    const drive = mockDrives.find(d => d.id === exp.driveId);
                                    return (
                                        <tr key={exp.id} className={idx !== mockExpenses.length - 1 ? 'border-b-2 border-[#005202]/20' : ''}>
                                            <td className="p-4 border-r-2 border-[#005202]/20">
                                                <span className="px-3 py-1 text-[10px] uppercase font-black rounded-lg border-2" style={{ borderColor: categoryColors[exp.category], color: categoryColors[exp.category], backgroundColor: `${categoryColors[exp.category]}15` }}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">{exp.description}</td>
                                            <td className="p-4 text-xs max-w-[200px] truncate">{drive?.title || 'Unknown'}</td>
                                            <td className="p-4 text-right text-lg font-black text-[#008303]">₹{exp.amount.toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                {exp.receipt ? <CheckCircle2 size={24} className="text-[#008303] mx-auto" /> : <span className="text-gray-400">-</span>}
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
