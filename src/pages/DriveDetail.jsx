import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDrives, mockDonations, mockExpenses } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
    MapPin, Calendar, Users, Clock, DollarSign, ArrowLeft,
    CheckCircle2, AlertTriangle, Award, Camera, Truck, Gift,
    Package, Heart, QrCode, Share2, ChevronDown
} from 'lucide-react';

export default function DriveDetail() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [selectedRole, setSelectedRole] = useState('');
    const [donateAmount, setDonateAmount] = useState('');
    const [showDonate, setShowDonate] = useState(false);
    const [booked, setBooked] = useState(false);
    const [donated, setDonated] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const drive = mockDrives.find(d => d.id === id);
    if (!drive) return (
        <div className="min-h-screen pt-32 flex items-center justify-center">
            <div className="text-center">
                <div className="text-5xl mb-16">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Drive not found</h2>
                <Link to="/drives" className="text-emerald-400 hover:underline">← Back to drives</Link>
            </div>
        </div>
    );

    const volProgress = (drive.currentVolunteers / drive.maxVolunteers) * 100;
    const fundProgress = (drive.currentFunding / drive.fundingGoal) * 100;
    const driveDonations = mockDonations.filter(d => d.driveId === drive.id);
    const driveExpenses = mockExpenses.filter(e => e.driveId === drive.id);
    const totalExpenses = driveExpenses.reduce((s, e) => s + e.amount, 0);

    const handleBook = () => {
        if (!selectedRole) return;
        setBooked(true);
    };

    const handleDonate = () => {
        if (!donateAmount || Number(donateAmount) <= 0) return;
        setDonated(true);
        setShowDonate(false);
    };

    const severityConfig = {
        critical: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' },
        high: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'High' },
        medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Medium' },
        low: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Low' },
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'roles', label: 'Roles & Slots' },
        { id: 'funding', label: 'Funding' },
        ...(drive.impact ? [{ id: 'impact', label: 'Impact Report' }] : []),
    ];

    const categoryIcons = { Equipment: Package, Transport: Truck, Refreshments: Gift, Misc: Package };

    return (
        <div className="min-h-screen pt-32 pb-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16">
                    <Link to="/drives" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-400 transition-colors">
                        <ArrowLeft size={16} /> Back to Drives
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-heavy overflow-hidden mb-16">
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />
                    <div className="p-10">
                        <div className="flex flex-wrap items-center gap-3 mb-16">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${drive.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                    drive.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-gray-500/20 text-gray-500'
                                }`}>
                                {drive.status}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${severityConfig[drive.severity].bg} ${severityConfig[drive.severity].color}`}>
                                ● {severityConfig[drive.severity].label} Severity
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-16 font-[var(--font-display)]">
                            {drive.title}
                        </h1>

                        <p className="text-gray-500 max-w-2xl mb-16 leading-relaxed">{drive.description}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><MapPin size={16} className="text-emerald-400" /></div>
                                <div>
                                    <div className="text-xs text-gray-600">Location</div>
                                    <div className="text-sm text-gray-900 font-medium truncate max-w-[120px]">{drive.location.address.split(',')[0]}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Calendar size={16} className="text-emerald-400" /></div>
                                <div>
                                    <div className="text-xs text-gray-600">Date</div>
                                    <div className="text-sm text-gray-900 font-medium">{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Clock size={16} className="text-emerald-400" /></div>
                                <div>
                                    <div className="text-xs text-gray-600">Time</div>
                                    <div className="text-sm text-gray-900 font-medium">{drive.time}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Users size={16} className="text-emerald-400" /></div>
                                <div>
                                    <div className="text-xs text-gray-600">Organizer</div>
                                    <div className="text-sm text-gray-900 font-medium truncate max-w-[120px]">{drive.organizer}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-1 mb-16 p-1 bg-white rounded-xl overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm border border-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Progress */}
                                <div className="glass-card p-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">PROGRESS</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Volunteers</span>
                                                <span className="text-emerald-400 font-bold">{drive.currentVolunteers}/{drive.maxVolunteers}</span>
                                            </div>
                                            <div className="h-3 bg-white shadow-sm border border-gray-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${volProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="progress-fill h-full" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Funding</span>
                                                <span className="text-emerald-400 font-bold">₹{drive.currentFunding.toLocaleString()} / ₹{drive.fundingGoal.toLocaleString()}</span>
                                            </div>
                                            <div className="h-3 bg-white shadow-sm border border-gray-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${fundProgress}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} className="progress-fill h-full" />
                                            </div>
                                        </div>
                                    </div>
                                    {drive.waitlist > 0 && (
                                        <div className="mt-4 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl text-xs text-orange-400">
                                            <AlertTriangle size={12} className="inline mr-1" /> {drive.waitlist} people on waitlist
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="glass-card p-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 font-[var(--font-display)]">TAGS</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {drive.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Book */}
                                {drive.status !== 'completed' && (
                                    <div className="glass-card p-10">
                                        <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">JOIN DRIVE</h3>
                                        {booked ? (
                                            <div className="text-center py-4">
                                                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-emerald-400">Slot Booked!</p>
                                                <p className="text-xs text-gray-600 mt-1">Role: {selectedRole}</p>
                                                <div className="mt-4 p-3 bg-white shadow-sm border border-gray-100 rounded-xl">
                                                    <QrCode size={80} className="text-emerald-400 mx-auto opacity-50" />
                                                    <p className="text-[10px] text-gray-600 mt-2">Your QR code for attendance</p>
                                                </div>
                                            </div>
                                        ) : isAuthenticated ? (
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-2">Select Role</label>
                                                <select
                                                    value={selectedRole}
                                                    onChange={e => setSelectedRole(e.target.value)}
                                                    className="w-full px-3 py-2.5 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-emerald-500/30 focus:outline-none mb-3"
                                                >
                                                    <option value="">Choose a role...</option>
                                                    {Object.entries(drive.roles).map(([role, { max, filled }]) => (
                                                        <option key={role} value={role} disabled={filled >= max}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)} ({max - filled} slots left)
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={handleBook} disabled={!selectedRole} className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed">
                                                    Book Slot
                                                </button>
                                            </div>
                                        ) : (
                                            <Link to="/login" className="btn-primary w-full block text-center">
                                                Login to Join
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* Donate */}
                                {drive.status !== 'completed' && (
                                    <div className="glass-card p-10">
                                        <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">FUND THIS DRIVE</h3>
                                        {donated ? (
                                            <div className="text-center py-4">
                                                <Heart size={40} className="text-emerald-400 mx-auto mb-2 fill-emerald-400" />
                                                <p className="text-sm font-semibold text-emerald-400">Thank you!</p>
                                                <p className="text-xs text-gray-600">Your donation is recorded.</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex gap-2 mb-3">
                                                    {[500, 1000, 2500, 5000].map(amt => (
                                                        <button
                                                            key={amt}
                                                            onClick={() => setDonateAmount(String(amt))}
                                                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${donateAmount === String(amt) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white shadow-sm border border-gray-100 text-gray-500 border border-gray-200 hover:border-emerald-500/20'
                                                                }`}
                                                        >
                                                            ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={donateAmount}
                                                    onChange={e => setDonateAmount(e.target.value)}
                                                    placeholder="Custom amount (₹)"
                                                    className="w-full px-3 py-2.5 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:border-emerald-500/30 focus:outline-none mb-3"
                                                />
                                                <button onClick={handleDonate} disabled={!donateAmount} className="btn-primary w-full disabled:opacity-30">
                                                    <DollarSign size={16} className="inline mr-1" /> Donate Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Share */}
                                <button className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-400 transition-colors">
                                    <Share2 size={16} /> Share this drive
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'roles' && (
                        <motion.div key="roles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            {Object.entries(drive.roles).map(([role, { max, filled }]) => {
                                const RoleIcon = role === 'photographer' ? Camera : role === 'logistics' ? Truck : role === 'coordinator' ? Award : Users;
                                const isFull = filled >= max;
                                return (
                                    <div key={role} className={`glass-card p-10 ${isFull ? 'border-red-500/10' : 'border-emerald-500/10'}`}>
                                        <div className="flex items-center gap-3 mb-16">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFull ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                                                <RoleIcon size={20} className={isFull ? 'text-red-400' : 'text-emerald-400'} />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-gray-900 capitalize font-[var(--font-display)]">{role}</h4>
                                                <p className="text-xs text-gray-600">{isFull ? 'All slots filled' : `${max - filled} slots available`}</p>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-white shadow-sm border border-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'progress-fill'}`} style={{ width: `${(filled / max) * 100}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs mt-2">
                                            <span className="text-gray-600">Filled</span>
                                            <span className={`font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>{filled}/{max}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'funding' && (
                        <motion.div key="funding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* Donations */}
                            <div className="glass-card p-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">RECENT DONATIONS</h3>
                                {driveDonations.length > 0 ? (
                                    <div className="space-y-3">
                                        {driveDonations.map(don => (
                                            <div key={don.id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-gray-900 text-xs font-bold">
                                                    {don.userName.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-gray-900">{don.userName}</div>
                                                    {don.message && <div className="text-xs text-gray-600">"{don.message}"</div>}
                                                </div>
                                                <div className="text-sm font-bold text-emerald-400">₹{don.amount.toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No donations yet. Be the first!</p>
                                )}
                            </div>

                            {/* Expenses */}
                            {driveExpenses.length > 0 && (
                                <div className="glass-card p-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">EXPENSE BREAKDOWN</h3>
                                    <div className="space-y-3">
                                        {driveExpenses.map(exp => {
                                            const ExpIcon = categoryIcons[exp.category] || Package;
                                            return (
                                                <div key={exp.id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                        <ExpIcon size={16} className="text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-gray-900">{exp.category}</div>
                                                        <div className="text-xs text-gray-600">{exp.description}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-gray-900">₹{exp.amount.toLocaleString()}</div>
                                                        {exp.receipt && <span className="text-[9px] text-emerald-500">✓ Receipt</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-500">Total Expenses</span>
                                        <span className="text-lg font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'impact' && drive.impact && (
                        <motion.div key="impact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="glass-card-heavy p-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">IMPACT REPORT</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 mb-16">
                                    {[
                                        { label: 'Waste Collected', value: `${drive.impact.wasteKg}kg`, icon: '♻️' },
                                        { label: 'Area Cleaned', value: `${drive.impact.areaSqm.toLocaleString()} m²`, icon: '🌍' },
                                        { label: 'Volunteers', value: drive.impact.volunteerCount, icon: '🙋' },
                                        { label: 'Work Hours', value: `${drive.impact.workHours}h`, icon: '⏱️' },
                                    ].map((m, i) => (
                                        <div key={i} className="glass-card p-4 text-center">
                                            <div className="text-2xl mb-2">{m.icon}</div>
                                            <div className="text-xl font-extrabold text-gray-900 font-[var(--font-display)]">{m.value}</div>
                                            <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 text-center">Before/after images and detailed records available on the Transparency Portal.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
