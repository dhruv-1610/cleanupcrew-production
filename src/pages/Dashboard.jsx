import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApiData } from '../hooks/useApiData';
import QRCodeModal from '../components/QRCodeModal';
import {
    LayoutDashboard, MapPin, Calendar, Trophy, DollarSign, QrCode,
    Award, Clock, Leaf, Star, TrendingUp, ArrowRight, ChevronRight,
    User, Settings, Heart, Download
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

const VOLUNTEER_BADGES = [
    { id: 'Bronze', name: 'Bronze Volunteer', description: 'Completed your first cleanup drive', requirement: '1 Completed Drive', icon: '🥉' },
    { id: 'Silver', name: 'Silver Volunteer', description: 'Veteran volunteer with 5 drives', requirement: '5 Completed Drives', icon: '🥈' },
    { id: 'Gold', name: 'Gold Volunteer', description: 'Elite cleanup champion with 15 drives', requirement: '15 Completed Drives', icon: '🥇' },
    { id: 'Platinum', name: 'Platinum Volunteer', description: 'Legendary eco-warrior with 30+ drives', requirement: '30 Completed Drives', icon: '💎' },
];

const DONOR_BADGES = [
    { id: 'Bronze', name: 'Bronze Donor', description: 'Funded your first cleanup', requirement: '₹1,000 Donated', icon: '💰' },
    { id: 'Silver', name: 'Silver Donor', description: 'Generous supporter of clean drives', requirement: '₹5,000 Donated', icon: '💳' },
    { id: 'Gold', name: 'Gold Donor', description: 'Major funding contributor', requirement: '₹20,000 Donated', icon: '🏆' },
    { id: 'Platinum', name: 'Platinum Donor', description: 'Top-tier philanthropist', requirement: '₹50,000 Donated', icon: '👑' },
];

const ALL_BADGES = [...VOLUNTEER_BADGES.map(b => ({...b, category: 'volunteer'})), ...DONOR_BADGES.map(b => ({...b, category: 'donor'}))];

export default function Dashboard() {
    const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [settingsName, setSettingsName] = useState('');
    const [settingsEmail, setSettingsEmail] = useState('');
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [qrModalData, setQrModalData] = useState(null);

    // ⚠️ ALL hooks must be called BEFORE any early returns (React Rules of Hooks)
    const { data: apiDrives } = useApiData('/api/drives', [], {
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res?.drives || []);
            return arr.map(d => ({ 
                ...d, 
                id: d._id || d.id,
                location: { address: d.locationAddress || d.location?.address || 'Location', ...d.location }
            }));
        }
    });

    // Early returns AFTER all hooks
    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated || !user) return <Navigate to="/login" />;

    const allDrives = apiDrives || [];
    // Match drives: user.drives contains IDs that could be _id or id format
    const userDriveIds = Array.isArray(user.drives) ? user.drives : [];
    const userDrives = allDrives.filter(d => 
        userDriveIds.includes(d.id) || userDriveIds.includes(d._id)
    );
    const userDonations = Array.isArray(user.donations) ? user.donations : [];
    const userBadges = ALL_BADGES.filter(b => {
        if (!Array.isArray(user.badges)) return false;
        // Backend sends tier names like 'Bronze', 'Silver' — match by ID
        return user.badges.includes(b.id);
    });

    const sideLinks = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'drives', label: 'My Drives', icon: MapPin },
        { id: 'donations', label: 'Donations', icon: DollarSign },
        { id: 'badges', label: 'Badges & Rewards', icon: Award },
        { id: 'attendance', label: 'QR Attendance', icon: QrCode },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen pt-20 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-64 flex-shrink-0">
                        <div className="glass-card p-5 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-900 text-xl font-black">
                                    {user.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-100">{user.name}</h3>
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/15">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-center pt-4 border-t border-slate-700/20">
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-slate-100">{user.points || 0}</div>
                                    <div className="text-[9px] text-slate-400 uppercase">Points</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-slate-100">#{user.rank || '-'}</div>
                                    <div className="text-[9px] text-slate-400 uppercase">Rank</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-slate-100">{userBadges.length}</div>
                                    <div className="text-[9px] text-slate-400 uppercase">Badges</div>
                                </div>
                            </div>
                        </div>

                        <nav className="glass-card p-2 space-y-0.5">
                            {sideLinks.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveSection(id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === id
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                                        }`}
                                >
                                    <Icon size={16} /> {label}
                                </button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'overview' && (
                            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                                <motion.h2 variants={fadeUp} className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">
                                    Dashboard <span className="gradient-text">Overview</span>
                                </motion.h2>

                                {/* Stats grid */}
                                <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { icon: MapPin, label: 'Drives Joined', value: user.drives?.length || 0 },
                                        { icon: Clock, label: 'Hours Volunteered', value: `${user.hoursVolunteered || 0}h` },
                                        { icon: Leaf, label: 'Waste Collected', value: `${user.wasteCollected || 0}kg` },
                                        { icon: Trophy, label: 'Leaderboard Rank', value: `#${user.rank || '-'}` },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="glass-card p-4 text-center">
                                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/10 flex items-center justify-center">
                                                <Icon size={18} className="text-emerald-400" />
                                            </div>
                                            <div className="text-xl font-extrabold text-slate-100 font-[var(--font-display)]">{value}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Upcoming drives */}
                                <motion.div variants={fadeUp} className="glass-card p-6 mb-6">
                                    <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Upcoming Drives</h3>
                                    {userDrives.filter(d => d.status !== 'completed').length > 0 ? (
                                        <div className="space-y-3">
                                            {userDrives.filter(d => d.status !== 'completed').map(drive => (
                                                <Link key={drive.id} to={`/drives/${drive.id}`} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/10 hover:border-emerald-500/15 transition-colors group">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">{drive.title}</div>
                                                        <div className="text-xs text-slate-400">{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} • {drive.time}</div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 text-center py-4">No upcoming drives. <Link to="/drives" className="text-emerald-400 hover:underline">Browse drives</Link></p>
                                    )}
                                </motion.div>

                                {/* Recent badges */}
                                <motion.div variants={fadeUp} className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-slate-100 mb-4 font-[var(--font-display)]">Your Badges</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {userBadges.map(badge => (
                                            <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                <span className="text-xl">{badge.icon}</span>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-200">{badge.name}</div>
                                                    <div className="text-[9px] text-slate-400">{badge.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {userBadges.length === 0 && (
                                            <p className="text-sm text-slate-400">No badges yet. Join drives to earn badges!</p>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeSection === 'drives' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">My <span className="gradient-text">Drives</span></h2>
                                <div className="space-y-4">
                                    {userDrives.map(drive => (
                                        <div key={drive.id} className="glass-card p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2 border ${drive.status === 'completed' ? 'bg-slate-500/10 text-slate-400 border-slate-500/10' :
                                                        drive.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' :
                                                            'bg-blue-500/10 text-blue-400 border-blue-500/15'
                                                        }`}>{drive.status}</span>
                                                    <h3 className="text-base font-bold text-slate-100">{drive.title}</h3>
                                                </div>
                                                <Link to={`/drives/${drive.id}`} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                                    View <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {drive.location.address.split(',')[0]}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            {drive.impact && (
                                                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/15 text-xs">
                                                    <span className="text-emerald-400">{drive.impact.wasteKg}kg waste</span>
                                                    <span className="text-cyan-400">{drive.impact.workHours}h worked</span>
                                                </div>
                                            )}
                                            
                                            {/* Action Buttons */}
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {(drive.status === 'upcoming' || drive.status === 'active' || drive.status === 'planned') && (
                                                    <button 
                                                        onClick={() => {
                                                            const attendance = user.attendances?.find(a => a.driveId === drive.id || a.driveId === drive._id);
                                                            if (attendance) {
                                                                setQrModalData({ attendance, drive });
                                                            } else {
                                                                alert('No attendance record found. Try refreshing.');
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                                                    >
                                                        <QrCode size={14} /> Show Entry Pass
                                                    </button>
                                                )}
                                                
                                                {drive.status === 'completed' && (
                                                    <Link to={`/certificate/${drive.id}`} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-lg hover:bg-emerald-500/15 transition-all">
                                                        <Award size={14} /> Download Certificate
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {userDrives.length === 0 && (
                                        <div className="text-center py-12">
                                            <MapPin size={40} className="text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-400">You haven't joined any drives yet.</p>
                                            <Link to="/drives" className="inline-block mt-3 text-sm text-emerald-400 hover:underline">Browse Drives →</Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'donations' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">My <span className="gradient-text">Donations</span></h2>
                                <div className="glass-card p-6 mb-6">
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-extrabold text-emerald-400 font-[var(--font-display)]">
                                            ₹{userDonations.reduce((s, d) => s + d.amount, 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-400 uppercase mt-1">Total Donated</div>
                                    </div>
                                    {userDonations.length > 0 ? (
                                        <div className="space-y-3">
                                            {userDonations.map((don, i) => {
                                                const drive = allDrives.find(d => d.id === don.driveId || d._id === don.driveId);
                                                return (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/15 rounded-xl">
                                                        <Heart size={16} className="text-emerald-400 fill-emerald-400 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-slate-200">{drive?.title || 'Cleanup Drive'}</div>
                                                            <div className="text-xs text-slate-400">{drive?.location?.address?.split(',')[0] || ''}</div>
                                                        </div>
                                                        <div className="text-sm font-bold text-emerald-400">₹{(don.amount || 0).toLocaleString()}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-slate-400">No donations yet.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'badges' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">Badges & <span className="gradient-text">Rewards</span></h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ALL_BADGES.map(badge => {
                                        const earned = user.badges?.includes(badge.id);
                                        return (
                                            <div key={`${badge.category}-${badge.id}`} className={`glass-card p-5 ${earned ? 'border-emerald-500/15' : 'opacity-40'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{badge.icon}</span>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-100">{badge.name}</h4>
                                                        <p className="text-xs text-slate-400">{badge.description}</p>
                                                        <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider ${earned ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                            {earned ? '✓ Earned' : badge.requirement}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'attendance' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">QR <span className="gradient-text">Attendance</span></h2>
                                <div className="glass-card p-8 text-center">
                                    <QrCode size={120} className="text-emerald-400/30 mx-auto mb-6" />
                                    <h3 className="text-lg font-bold text-slate-100 mb-2">Your Attendance QR Code</h3>
                                    <p className="text-sm text-slate-400 mb-6">Show this at the cleanup drive for attendance verification</p>
                                    <div className="p-4 bg-slate-800/30 border border-slate-700/15 rounded-xl inline-block">
                                        <div className="text-xs text-slate-500 mb-1">User ID</div>
                                        <div className="text-sm font-mono text-emerald-400">{user.id}</div>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        {userDrives.filter(d => d.status === 'completed').map(drive => (
                                            <div key={drive.id} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/8 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <span className="text-sm text-slate-200 flex-1 text-left">{drive.title}</span>
                                                <span className="text-xs text-emerald-400">✓ Attended</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'settings' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">Account <span className="gradient-text">Settings</span></h2>
                                <div className="glass-card p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Full Name</label>
                                        <input value={settingsName || user.name} onChange={e => setSettingsName(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Email</label>
                                        <input value={settingsEmail || user.email} onChange={e => setSettingsEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Role</label>
                                        <div className="px-4 py-3 bg-slate-800/30 border border-slate-700/15 rounded-xl text-sm text-slate-400 capitalize">{user.role}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Member Since</label>
                                        <div className="px-4 py-3 bg-slate-800/30 border border-slate-700/15 rounded-xl text-sm text-slate-400">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const updates = {};
                                            if (settingsName && settingsName !== user.name) updates.name = settingsName;
                                            if (settingsEmail && settingsEmail !== user.email) updates.email = settingsEmail;
                                            if (Object.keys(updates).length > 0) updateUser(updates);
                                            setSettingsSaved(true);
                                            setTimeout(() => setSettingsSaved(false), 2500);
                                        }}
                                        className="btn-primary !py-3"
                                    >
                                        {settingsSaved ? '✓ Saved!' : 'Save Changes'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Code Modal for user's entry pass */}
            {qrModalData && (
                <QRCodeModal 
                    isOpen={!!qrModalData} 
                    onClose={() => setQrModalData(null)}
                    attendance={qrModalData.attendance}
                    driveTitle={qrModalData.drive.title}
                    driveLocation={qrModalData.drive.location?.address}
                    driveDate={qrModalData.drive.date}
                />
            )}
        </div>
    );
}
