import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import {
    MapPin, Calendar, Users, Clock, DollarSign, ArrowLeft,
    CheckCircle2, AlertTriangle, Award, Camera, Truck, Gift,
    Package, Heart, QrCode, Share2, ChevronDown
} from 'lucide-react';
import StripePaymentModal from '../components/StripePaymentModal';
import BookingModal from '../components/BookingModal';

export default function DriveDetail() {
    const { id } = useParams();
    const { isAuthenticated, user, apiOnline, refreshUser } = useAuth();
    const [selectedRole, setSelectedRole] = useState('');
    const [donateAmount, setDonateAmount] = useState('');
    const [showDonate, setShowDonate] = useState(false);
    const [showStripe, setShowStripe] = useState(false);
    const [justBooked, setJustBooked] = useState(false);
    const [donated, setDonated] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showBookingModal, setShowBookingModal] = useState(false);

    const { data: driveData, loading, refetch } = useApiData(`/api/drives/${id}`, null, {
        pollInterval: 10000, // Poll every 10s for real-time volunteer/funding updates
        transform: (res) => {
            const d = res.drive || res;
            if (!d) return null;
            
            const impact = d.impactSummary ? {
                wasteKg: d.impactSummary.wasteCollected || 0,
                areaSqm: d.impactSummary.areaCleaned || 0,
                workHours: d.impactSummary.workHours || 0,
                volunteerCount: d.currentVolunteers ?? d.requiredRoles?.reduce((s, r) => s + (r.booked || 0), 0) ?? 0,
                beforePhotos: d.impactSummary.beforePhotos || [],
                afterPhotos: d.impactSummary.afterPhotos || []
            } : null;

            return {
                ...d,
                id: d._id || d.id,
                location: { address: d.locationAddress || d.location?.address || 'Location TBD', ...d.location },
                roles: d.roles || (d.requiredRoles ? Object.fromEntries(
                    d.requiredRoles.map(r => [r.role, { max: r.capacity, filled: r.booked || 0 }])
                ) : {}),
                currentVolunteers: d.currentVolunteers ?? d.requiredRoles?.reduce((s, r) => s + (r.booked || 0), 0) ?? 0,
                maxVolunteers: d.maxVolunteers ?? d.requiredRoles?.reduce((s, r) => s + r.capacity, 0) ?? 0,
                currentFunding: d.currentFunding ?? d.fundingRaised ?? 0,
                fundingGoal: d.fundingGoal ?? 0,
                severity: d.severity || 'medium',
                status: d.status === 'planned' ? 'upcoming' : d.status,
                impact: impact || d.impact
            };
        }
    });

    // Fetch REAL donations and expenses for this drive from API
    const { data: driveDonations } = useApiData(`/api/drives/${id}/donations`, [], {
        transform: (res) => res.donations || [],
    });
    const { data: driveExpenses } = useApiData(`/api/drives/${id}/expenses`, [], {
        transform: (res) => res.expenses || [],
    });

    const handleShare = async () => {
        const shareData = { title: driveData?.title || 'Cleanup Drive', text: 'Join this cleanup drive!', url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch { /* ignore */ }
    };

    const handleBooking = () => {
        if (!selectedRole || !isAuthenticated) return;
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async (formData) => {
        try {
            if (apiOnline) {
                // First, patch the user profile with the new form data
                await api.patch('/api/users/me', {
                    emergencyContact: formData.emergencyContact,
                    medicalNotes: formData.medicalNotes
                });
                
                // Then, book the slot
                await api.post(`/api/drives/${id}/book`, { role: selectedRole });
                
                await refetch();
                await refreshUser();
            }
            setShowBookingModal(false);
            setJustBooked(true);
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Booking failed');
        }
    };

    // Derive booked state from user's attendance records (persists across page reloads)
    const existingAttendance = user?.attendances?.find(a => a.driveId === id) || user?.drives?.includes(id);
    const booked = justBooked || !!existingAttendance;
    const bookedRole = (typeof existingAttendance === 'object' ? existingAttendance.role : null) || selectedRole;

    const handlePaymentSuccess = async (info) => {
        setPaymentInfo(info);
        setShowStripe(false);
        setDonated(true);
        if (apiOnline) {
            try {
                await api.post(`/api/drives/${id}/donate`, { amount: Number(donateAmount) });
                await refetch();
                // Refresh user data so Dashboard shows updated donations
                await refreshUser();
            } catch (error) {
                console.error("Donation recording failed:", error);
            }
        }
    };

    if (loading && !driveData) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
            </div>
        );
    }

    const drive = driveData || fallbackDrive;

    if (!drive) return (
        <div className="min-h-screen pt-32 flex items-center justify-center">
            <div className="text-center">
                <div className="text-5xl mb-6">🔍</div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Drive not found</h2>
                <Link to="/drives" className="text-emerald-400 hover:underline">← Back to drives</Link>
            </div>
        </div>
    );

    const volProgress = drive.maxVolunteers > 0 ? (drive.currentVolunteers / drive.maxVolunteers) * 100 : 0;
    const fundProgress = drive.fundingGoal > 0 ? (drive.currentFunding / drive.fundingGoal) * 100 : 0;
    const totalExpenses = (driveExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);

    const handleDonateModal = () => {
        if (!donateAmount || Number(donateAmount) <= 0) return;
        setShowStripe(true);
    };

    const severityConfig = {
        critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', label: 'Critical' },
        high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/15', label: 'High' },
        medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15', label: 'Medium' },
        low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/15', label: 'Low' },
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                    <Link to="/drives" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                        <ArrowLeft size={16} /> Back to Drives
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-heavy overflow-hidden mb-8">
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500" />
                    <div className="p-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${drive.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' :
                                drive.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/15' :
                                    'bg-slate-500/10 text-slate-400 border-slate-500/15'
                                }`}>
                                {drive.status}
                            </span>
                            {drive.severity && severityConfig[drive.severity] && (
                                <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${severityConfig[drive.severity].bg} ${severityConfig[drive.severity].color} ${severityConfig[drive.severity].border}`}>
                                    ● {severityConfig[drive.severity].label} Severity
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-4 font-[var(--font-display)]">
                            {drive.title}
                        </h1>

                        <p className="text-slate-400 max-w-2xl mb-6 leading-relaxed">{drive.description || 'Join us for this community cleanup drive and help make our city cleaner and greener.'}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: MapPin, label: 'Location', value: drive.location?.address ? drive.location.address.split(',')[0] : 'Various' },
                                { icon: Calendar, label: 'Date', value: new Date(drive.date || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                { icon: Clock, label: 'Time', value: drive.time || '09:00 AM' },
                                { icon: Users, label: 'Organizer', value: drive.organizer || 'Local Admin' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/8 border border-emerald-500/10 flex items-center justify-center"><Icon size={16} className="text-emerald-400" /></div>
                                    <div>
                                        <div className="text-xs text-slate-500">{label}</div>
                                        <div className="text-sm text-slate-200 font-medium truncate max-w-[120px]">{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-1 mb-8 p-1 bg-slate-800/30 backdrop-blur-sm border border-slate-700/15 rounded-xl overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                : 'text-slate-400 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Progress */}
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Progress</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-400">Volunteers</span>
                                                <span className="text-emerald-400 font-semibold">{drive.currentVolunteers}/{drive.maxVolunteers}</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-800/50 border border-slate-700/15 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${volProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-400">Funding</span>
                                                <span className="text-cyan-400 font-semibold">₹{(drive.currentFunding / 100).toLocaleString()} / ₹{(drive.fundingGoal / 100).toLocaleString()}</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-800/50 border border-slate-700/15 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${fundProgress}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" />
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
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-slate-100 mb-3 font-[var(--font-display)]">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(drive.tags || ['Community', 'Environment', 'Cleanup']).map(tag => (
                                            <span key={tag} className="px-3 py-1 text-xs font-medium bg-emerald-500/8 text-emerald-400 border border-emerald-500/10 rounded-full">
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
                                    <div className="glass-card p-6">
                                        <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Join Drive</h3>
                                        {booked ? (
                                            <div className="text-center py-4">
                                                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-emerald-400">You've Already Booked!</p>
                                                {bookedRole && <p className="text-xs text-slate-400 mt-1">Role: {bookedRole}</p>}
                                                <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/15 rounded-xl">
                                                    <QrCode size={80} className="text-emerald-400/40 mx-auto" />
                                                    <p className="text-[10px] text-slate-500 mt-2">Your QR code for attendance</p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-3">Check your Dashboard for your entry pass</p>
                                            </div>
                                        ) : isAuthenticated ? (
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-2">Select Role</label>
                                                <select
                                                    value={selectedRole}
                                                    onChange={e => setSelectedRole(e.target.value)}
                                                    className="w-full px-3 py-2.5 rounded-xl text-sm mb-3"
                                                >
                                                    <option value="">Choose a role...</option>
                                                    {Object.entries(drive.roles).map(([role, { max, filled }]) => (
                                                        <option key={role} value={role} disabled={filled >= max}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)} ({max - filled} slots left)
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={handleBooking} disabled={!selectedRole} className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed">
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
                                    <div className="glass-card p-6">
                                        <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Fund This Drive</h3>
                                        {donated ? (
                                            <div className="text-center py-4">
                                                <Heart size={40} className="text-emerald-400 mx-auto mb-2 fill-emerald-400" />
                                                <p className="text-sm font-semibold text-emerald-400">Thank you!</p>
                                                <p className="text-xs text-slate-400">₹{Number(donateAmount).toLocaleString()} donated via Stripe</p>
                                                {paymentInfo && (
                                                    <p className="text-[10px] text-slate-500 mt-1">Card: {paymentInfo.brand} •••• {paymentInfo.last4}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex gap-2 mb-3">
                                                    {[500, 1000, 2500, 5000].map(amt => (
                                                        <button
                                                            key={amt}
                                                            onClick={() => setDonateAmount(String(amt))}
                                                            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all border ${donateAmount === String(amt) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800/30 text-slate-400 border-slate-700/15 hover:border-emerald-500/15'
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
                                                    className="w-full px-3 py-2.5 rounded-xl text-sm mb-3"
                                                />
                                                <button onClick={handleDonateModal} disabled={!donateAmount} className="btn-primary w-full disabled:opacity-30">
                                                    <DollarSign size={16} className="inline mr-1" /> Donate Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                    <Share2 size={16} /> <span id="share-btn-text">Share this drive</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'roles' && (
                        <motion.div key="roles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(drive.roles).map(([role, { max, filled }]) => {
                                const RoleIcon = role === 'photographer' ? Camera : role === 'logistics' ? Truck : role === 'coordinator' ? Award : Users;
                                const isFull = filled >= max;
                                return (
                                    <div key={role} className="glass-card p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFull ? 'bg-red-500/8 border border-red-500/10' : 'bg-emerald-500/8 border border-emerald-500/10'}`}>
                                                <RoleIcon size={20} className={isFull ? 'text-red-400' : 'text-emerald-400'} />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-slate-100 capitalize font-[var(--font-display)]">{role}</h4>
                                                <p className="text-xs text-slate-400">{isFull ? 'All slots filled' : `${max - filled} slots available`}</p>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-800/50 border border-slate-700/15 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${isFull ? 'bg-red-500/80' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${(filled / max) * 100}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs mt-2">
                                            <span className="text-slate-500">Filled</span>
                                            <span className={`font-semibold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>{filled}/{max}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'funding' && (
                        <motion.div key="funding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* Donations */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Recent Donations</h3>
                                {driveDonations && driveDonations.length > 0 ? (
                                    <div className="space-y-3">
                                        {driveDonations.map(don => (
                                            <div key={don.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/15 rounded-xl">
                                                {don.userAvatar ? (
                                                    <img src={don.userAvatar} alt={don.userName} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-900 text-xs font-bold">
                                                        {don.userName ? don.userName.charAt(0).toUpperCase() : <Heart size={14} />}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-slate-200">{don.userName || 'Anonymous Donor'}</div>
                                                    <div className="text-xs text-slate-400">{new Date(don.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                </div>
                                                <div className="text-sm font-bold text-emerald-400">₹{(don.amount / 100).toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Heart size={32} className="text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">No donations yet. Be the first to support this drive!</p>
                                    </div>
                                )}
                            </div>

                            {/* Expenses */}
                            {driveExpenses && driveExpenses.length > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Expense Breakdown</h3>
                                    <div className="space-y-3">
                                        {driveExpenses.map(exp => {
                                            const ExpIcon = categoryIcons[exp.category?.charAt(0).toUpperCase() + exp.category?.slice(1)] || Package;
                                            return (
                                                <div key={exp.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/15 rounded-xl">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/8 border border-emerald-500/10 flex items-center justify-center">
                                                        <ExpIcon size={16} className="text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-slate-200 capitalize">{exp.category}</div>
                                                        <div className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-slate-200">₹{((exp.amount || 0) / 100).toLocaleString()}</div>
                                                        {exp.isVerified && <span className="text-[9px] text-emerald-400">✓ Verified</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-700/20 flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-400">Total Expenses</span>
                                        <span className="text-lg font-bold text-slate-100">₹{(totalExpenses / 100).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'impact' && drive.impact && (
                        <motion.div key="impact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="glass-card-heavy p-8">
                                <h3 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">Impact Report</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Waste Collected', value: `${drive.impact.wasteKg}kg`, icon: '♻️' },
                                        { label: 'Area Cleaned', value: `${drive.impact.areaSqm.toLocaleString()} m²`, icon: '🌍' },
                                        { label: 'Volunteers', value: drive.impact.volunteerCount, icon: '🙋' },
                                        { label: 'Work Hours', value: `${drive.impact.workHours}h`, icon: '⏱️' },
                                    ].map((m, i) => (
                                        <div key={i} className="glass-card p-4 text-center">
                                            <div className="text-2xl mb-2">{m.icon}</div>
                                            <div className="text-xl font-extrabold text-slate-100 font-[var(--font-display)]">{m.value}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{m.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Impact Photos Gallery */}
                                {(drive.impact.beforePhotos?.length > 0 || drive.impact.afterPhotos?.length > 0) && (
                                    <div className="mb-8">
                                        <h4 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Visual Impact</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {drive.impact.beforePhotos?.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {drive.impact.beforePhotos.map((url, idx) => (
                                                            <img key={idx} src={`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')}${url}`} className="w-full h-32 object-cover rounded-xl border border-slate-700/30" alt="Before" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {drive.impact.afterPhotos?.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">After</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {drive.impact.afterPhotos.map((url, idx) => (
                                                            <img key={idx} src={`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')}${url}`} className="w-full h-32 object-cover rounded-xl border border-slate-700/30" alt="After" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm text-slate-400 text-center mb-4">Detailed records available on the Transparency Portal.</p>
                                {isAuthenticated && user?.drives?.includes(drive.id) && (
                                    <div className="text-center">
                                        <Link to={`/certificate/${drive.id}`} className="btn-primary inline-flex items-center gap-2">
                                            <Award size={18} /> Get Your Certificate
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stripe Payment Modal */}
            <StripePaymentModal
                isOpen={showStripe}
                onClose={() => setShowStripe(false)}
                amount={Number(donateAmount) || 0}
                driveName={drive.title}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Booking Modal */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                role={selectedRole}
                driveName={drive.title}
                onConfirm={handleConfirmBooking}
            />
        </div>
    );
}
