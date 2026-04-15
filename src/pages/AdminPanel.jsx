import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { mockDrives, mockSpots, mockStats, mockDonations, mockExpenses } from '../data/mockData';
import {
    LayoutDashboard, MapPin, Users, DollarSign, Settings, Shield,
    BarChart3, Plus, Edit, Trash2, CheckCircle2, X, QrCode,
    Upload, Eye, AlertTriangle, Calendar, Clock, Leaf, Globe
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

export default function AdminPanel() {
    const { user, isAuthenticated } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [spotStatuses, setSpotStatuses] = useState({});

    if (!isAuthenticated) return <Navigate to="/login" />;

    const sideLinks = [
        { id: 'overview', label: 'Analytics', icon: BarChart3 },
        { id: 'drives', label: 'Manage Drives', icon: MapPin },
        { id: 'spots', label: 'Verify Spots', icon: AlertTriangle },
        { id: 'attendance', label: 'Attendance', icon: QrCode },
        { id: 'expenses', label: 'Expenses', icon: DollarSign },
        { id: 'users', label: 'Users', icon: Users },
    ];

    const handleApproveSpot = (spotId) => {
        setSpotStatuses(prev => ({ ...prev, [spotId]: 'verified' }));
    };

    const handleRejectSpot = (spotId) => {
        setSpotStatuses(prev => ({ ...prev, [spotId]: 'rejected' }));
    };

    return (
        <div className="min-h-screen pt-20 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-64 flex-shrink-0">
                        <div className="glass-card p-5 mb-16">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                    <Shield size={24} className="text-gray-900" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Admin Panel</h3>
                                    <p className="text-xs text-gray-600">Full control center</p>
                                </div>
                            </div>
                        </div>

                        <nav className="glass-card p-2 space-y-0.5">
                            {sideLinks.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveSection(id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === id
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm border border-gray-100'
                                        }`}
                                >
                                    <Icon size={16} /> {label}
                                </button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'overview' && (
                            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                                <motion.h2 variants={fadeUp} className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">
                                    PLATFORM <span className="gradient-text">ANALYTICS</span>
                                </motion.h2>

                                <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                                    {[
                                        { icon: Globe, label: 'Total Drives', value: mockStats.totalDrives, color: 'bg-emerald-600' },
                                        { icon: Users, label: 'Total Volunteers', value: mockStats.totalVolunteers.toLocaleString(), color: 'bg-emerald-700' },
                                        { icon: DollarSign, label: 'Funds Raised', value: `₹${(mockStats.totalFundsRaised / 100000).toFixed(1)}L`, color: 'bg-emerald-600' },
                                        { icon: Leaf, label: 'Waste Collected', value: `${(mockStats.totalWasteKg / 1000).toFixed(1)}T`, color: 'bg-emerald-700' },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="glass-card p-5 text-center">
                                            <div className={`w-11 h-11 mx-auto mb-3 rounded-xl ${color} flex items-center justify-center`}>
                                                <Icon size={20} className="text-gray-900" />
                                            </div>
                                            <div className="text-2xl font-extrabold text-gray-900 font-[var(--font-display)]">{value}</div>
                                            <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">{label}</div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Additional stats */}
                                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                                    <div className="glass-card p-5">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Drive Status</h4>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Active', count: mockDrives.filter(d => d.status === 'active').length, color: 'bg-emerald-400' },
                                                { label: 'Upcoming', count: mockDrives.filter(d => d.status === 'upcoming').length, color: 'bg-blue-400' },
                                                { label: 'Completed', count: mockDrives.filter(d => d.status === 'completed').length, color: 'bg-gray-400' },
                                            ].map(s => (
                                                <div key={s.label} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                                        <span className="text-sm text-gray-500">{s.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card p-5">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Spot Reports</h4>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Reported', count: mockSpots.filter(s => s.status === 'reported').length, color: 'bg-red-400' },
                                                { label: 'Verified', count: mockSpots.filter(s => s.status === 'verified').length, color: 'bg-orange-400' },
                                                { label: 'Cleaned', count: mockSpots.filter(s => s.status === 'cleaned').length, color: 'bg-emerald-400' },
                                            ].map(s => (
                                                <div key={s.label} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                                        <span className="text-sm text-gray-500">{s.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card p-5">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Quick Actions</h4>
                                        <div className="space-y-2">
                                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                                                <Plus size={14} /> Create Drive
                                            </button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-50 border border-gray-200 transition-colors">
                                                <Upload size={14} /> Upload Expenses
                                            </button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-50 border border-gray-200 transition-colors">
                                                <Eye size={14} /> View Reports
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeSection === 'drives' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-16">
                                    <h2 className="text-2xl font-black text-gray-900 font-[var(--font-display)]">MANAGE <span className="gradient-text">DRIVES</span></h2>
                                    <button className="btn-primary flex items-center gap-2 !py-2 !px-4 !text-sm">
                                        <Plus size={16} /> New Drive
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {mockDrives.map(drive => (
                                        <div key={drive.id} className="glass-card p-5 flex items-center gap-12">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${drive.status === 'active' ? 'bg-emerald-400' :
                                                    drive.status === 'upcoming' ? 'bg-blue-400' : 'bg-gray-400'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{drive.title}</h3>
                                                <div className="flex gap-12 text-xs text-gray-600 mt-0.5">
                                                    <span>{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                    <span>{drive.currentVolunteers}/{drive.maxVolunteers} vol</span>
                                                    <span>₹{(drive.currentFunding / 1000).toFixed(0)}k/{(drive.fundingGoal / 1000).toFixed(0)}k</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                                                    <Edit size={14} />
                                                </button>
                                                <button className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'spots' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">VERIFY <span className="gradient-text">SPOTS</span></h2>
                                <div className="space-y-3">
                                    {mockSpots.map(spot => {
                                        const overrideStatus = spotStatuses[spot.id];
                                        const currentStatus = overrideStatus || spot.status;
                                        return (
                                            <div key={spot.id} className={`glass-card p-5 ${overrideStatus === 'rejected' ? 'opacity-40' : ''}`}>
                                                <div className="flex items-start gap-12">
                                                    <div className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 ${currentStatus === 'reported' ? 'bg-red-400' :
                                                            currentStatus === 'verified' ? 'bg-orange-400' :
                                                                currentStatus === 'cleaned' ? 'bg-emerald-400' :
                                                                    currentStatus === 'rejected' ? 'bg-gray-600' : 'bg-blue-400'
                                                        }`} />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-gray-900">{spot.description}</div>
                                                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                                            <span className="capitalize">Severity: {spot.severity}</span>
                                                            <span>Status: {currentStatus}</span>
                                                            <span>{new Date(spot.reportedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                    </div>
                                                    {currentStatus === 'reported' && (
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => handleApproveSpot(spot.id)}
                                                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectSpot(spot.id)}
                                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {currentStatus === 'verified' && (
                                                        <span className="text-xs text-emerald-400 font-semibold flex-shrink-0">✓ Verified</span>
                                                    )}
                                                    {overrideStatus === 'rejected' && (
                                                        <span className="text-xs text-red-400 font-semibold flex-shrink-0">✗ Rejected</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'attendance' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">QR <span className="gradient-text">ATTENDANCE</span></h2>
                                <div className="glass-card p-10 text-center mb-16">
                                    <QrCode size={60} className="text-emerald-400 mx-auto mb-16 opacity-60" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Scan QR Codes</h3>
                                    <p className="text-sm text-gray-600 mb-16">Use the scanner to verify volunteer attendance at events</p>
                                    <button className="btn-primary">Start Scanner</button>
                                </div>
                                <div className="glass-card p-10">
                                    <h3 className="text-sm font-bold text-gray-900 mb-16 uppercase tracking-wider">Recent Attendance Logs</h3>
                                    <div className="space-y-2">
                                        {[
                                            { name: 'Arjun Mehta', drive: 'Mumbai Beach Cleanup', time: '06:12 AM', status: 'checked-in' },
                                            { name: 'Kavya Nair', drive: 'Mumbai Beach Cleanup', time: '06:15 AM', status: 'checked-in' },
                                            { name: 'Rohit Joshi', drive: 'Mumbai Beach Cleanup', time: '06:20 AM', status: 'checked-in' },
                                        ].map((log, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-900 font-medium">{log.name}</div>
                                                    <div className="text-xs text-gray-600">{log.drive}</div>
                                                </div>
                                                <div className="text-xs text-gray-500">{log.time}</div>
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase">✓ {log.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'expenses' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-16">
                                    <h2 className="text-2xl font-black text-gray-900 font-[var(--font-display)]">MANAGE <span className="gradient-text">EXPENSES</span></h2>
                                    <button className="btn-primary flex items-center gap-2 !py-2 !px-4 !text-sm">
                                        <Upload size={16} /> Upload Expense
                                    </button>
                                </div>
                                <div className="overflow-x-auto glass-card p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-200">
                                                <th className="pb-3 pr-4">Category</th>
                                                <th className="pb-3 pr-4">Description</th>
                                                <th className="pb-3 pr-4 text-right">Amount</th>
                                                <th className="pb-3 pr-4">Date</th>
                                                <th className="pb-3 text-center">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {mockExpenses.map(exp => (
                                                <tr key={exp.id} className="text-gray-500 hover:text-gray-900 hover:bg-white transition-colors">
                                                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">{exp.category}</td>
                                                    <td className="py-3 pr-4 text-xs">{exp.description}</td>
                                                    <td className="py-3 pr-4 text-right font-semibold text-gray-900">₹{exp.amount.toLocaleString()}</td>
                                                    <td className="py-3 pr-4 text-xs">{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                    <td className="py-3 text-center">
                                                        {exp.receipt ? <CheckCircle2 size={14} className="text-emerald-400 mx-auto" /> : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'users' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">MANAGE <span className="gradient-text">USERS</span></h2>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Arjun Mehta', email: 'arjun@email.com', role: 'volunteer', status: 'active', drives: 24 },
                                        { name: 'Priya Sharma', email: 'priya@email.com', role: 'donor', status: 'active', drives: 0 },
                                        { name: 'Rohit Joshi', email: 'rohit@email.com', role: 'volunteer', status: 'active', drives: 19 },
                                        { name: 'Ananya Gupta', email: 'ananya@email.com', role: 'donor', status: 'active', drives: 2 },
                                        { name: 'Vikram Singh', email: 'vikram@email.com', role: 'volunteer', status: 'suspended', drives: 7 },
                                    ].map((u, i) => (
                                        <div key={i} className="glass-card p-4 flex items-center gap-12">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-gray-900 text-sm font-bold flex-shrink-0">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                                                <div className="text-xs text-gray-600">{u.email}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${u.role === 'volunteer' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                                }`}>{u.role}</span>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                }`}>{u.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
