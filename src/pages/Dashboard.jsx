import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { mockDrives, mockBadges, mockDonations } from '../data/mockData';
import {
    LayoutDashboard, MapPin, Calendar, Trophy, DollarSign, QrCode,
    Award, Clock, Leaf, Star, TrendingUp, ArrowRight, ChevronRight,
    User, Settings, Heart
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');

    if (!isAuthenticated) return <Navigate to="/login" />;

    const userDrives = mockDrives.filter(d => user.drives?.includes(d.id));
    const userDonations = user.donations || [];
    const userBadges = mockBadges.filter(b => user.badges?.includes(b.id));

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
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-64 flex-shrink-0">
                        <div className="glass-card p-10 mb-16">
                            <div className="flex items-center gap-3 mb-16">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-gray-900 text-xl font-black">
                                    {user.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded-full">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-12 text-center pt-4 border-t border-gray-200">
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-gray-900">{user.points}</div>
                                    <div className="text-[9px] text-gray-600 uppercase">Points</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-gray-900">#{user.rank}</div>
                                    <div className="text-[9px] text-gray-600 uppercase">Rank</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-gray-900">{userBadges.length}</div>
                                    <div className="text-[9px] text-gray-600 uppercase">Badges</div>
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

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'overview' && (
                            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                                <motion.h2 variants={fadeUp} className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">
                                    DASHBOARD <span className="gradient-text">OVERVIEW</span>
                                </motion.h2>

                                {/* Stats grid */}
                                <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                                    {[
                                        { icon: MapPin, label: 'Drives Joined', value: user.drives?.length || 0, color: 'bg-emerald-600' },
                                        { icon: Clock, label: 'Hours Volunteered', value: `${user.hoursVolunteered}h`, color: 'bg-emerald-700' },
                                        { icon: Leaf, label: 'Waste Collected', value: `${user.wasteCollected}kg`, color: 'bg-emerald-600' },
                                        { icon: Trophy, label: 'Leaderboard Rank', value: `#${user.rank}`, color: 'bg-emerald-700' },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="glass-card p-4 text-center">
                                            <div className={`w-10 h-10 mx-auto mb-2 rounded-xl ${color} flex items-center justify-center`}>
                                                <Icon size={18} className="text-gray-900" />
                                            </div>
                                            <div className="text-xl font-extrabold text-gray-900 font-[var(--font-display)]">{value}</div>
                                            <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">{label}</div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Upcoming drives */}
                                <motion.div variants={fadeUp} className="glass-card p-10 mb-16">
                                    <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">UPCOMING DRIVES</h3>
                                    {userDrives.filter(d => d.status !== 'completed').length > 0 ? (
                                        <div className="space-y-3">
                                            {userDrives.filter(d => d.status !== 'completed').map(drive => (
                                                <Link key={drive.id} to={`/drives/${drive.id}`} className="flex items-center gap-12 p-3 rounded-xl bg-white hover:bg-white shadow-sm border border-gray-100 transition-colors group">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-300 transition-colors truncate">{drive.title}</div>
                                                        <div className="text-xs text-gray-600">{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} • {drive.time}</div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 text-center py-4">No upcoming drives. <Link to="/drives" className="text-emerald-400 hover:underline">Browse drives</Link></p>
                                    )}
                                </motion.div>

                                {/* Recent badges */}
                                <motion.div variants={fadeUp} className="glass-card p-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-16 font-[var(--font-display)]">YOUR BADGES</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {userBadges.map(badge => (
                                            <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                                                <span className="text-xl">{badge.icon}</span>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-900">{badge.name}</div>
                                                    <div className="text-[9px] text-gray-600">{badge.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {userBadges.length === 0 && (
                                            <p className="text-sm text-gray-600">No badges yet. Join drives to earn badges!</p>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeSection === 'drives' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">MY <span className="gradient-text">DRIVES</span></h2>
                                <div className="space-y-4">
                                    {userDrives.map(drive => (
                                        <div key={drive.id} className="glass-card p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2 ${drive.status === 'completed' ? 'bg-gray-500/20 text-gray-500' :
                                                            drive.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                'bg-blue-500/20 text-blue-400'
                                                        }`}>{drive.status}</span>
                                                    <h3 className="text-base font-bold text-gray-900">{drive.title}</h3>
                                                </div>
                                                <Link to={`/drives/${drive.id}`} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                                    View <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                            <div className="flex flex-wrap gap-12 text-xs text-gray-600">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {drive.location.address.split(',')[0]}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            {drive.impact && (
                                                <div className="flex gap-12 mt-3 pt-3 border-t border-gray-200 text-xs">
                                                    <span className="text-emerald-400">{drive.impact.wasteKg}kg waste</span>
                                                    <span className="text-emerald-400">{drive.impact.workHours}h worked</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {userDrives.length === 0 && (
                                        <div className="text-center py-12">
                                            <MapPin size={40} className="text-gray-700 mx-auto mb-3" />
                                            <p className="text-gray-600">You haven't joined any drives yet.</p>
                                            <Link to="/drives" className="inline-block mt-3 text-sm text-emerald-400 hover:underline">Browse Drives →</Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'donations' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">MY <span className="gradient-text">DONATIONS</span></h2>
                                <div className="glass-card p-10 mb-16">
                                    <div className="text-center mb-16">
                                        <div className="text-3xl font-extrabold text-emerald-400 font-[var(--font-display)]">
                                            ₹{userDonations.reduce((s, d) => s + d.amount, 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-600 uppercase mt-1">Total Donated</div>
                                    </div>
                                    {userDonations.length > 0 ? (
                                        <div className="space-y-3">
                                            {userDonations.map((don, i) => {
                                                const drive = mockDrives.find(d => d.id === don.driveId);
                                                return (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                                        <Heart size={16} className="text-emerald-400 fill-emerald-400 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900">{drive?.title || 'Unknown Drive'}</div>
                                                            <div className="text-xs text-gray-600">{drive?.location?.address?.split(',')[0]}</div>
                                                        </div>
                                                        <div className="text-sm font-bold text-emerald-400">₹{don.amount.toLocaleString()}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-gray-600">No donations yet.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'badges' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">BADGES & <span className="gradient-text">REWARDS</span></h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                                    {mockBadges.map(badge => {
                                        const earned = user.badges?.includes(badge.id);
                                        return (
                                            <div key={badge.id} className={`glass-card p-5 ${earned ? 'border-emerald-500/20' : 'opacity-40'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{badge.icon}</span>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{badge.name}</h4>
                                                        <p className="text-xs text-gray-600">{badge.description}</p>
                                                        <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider ${earned ? 'text-emerald-400' : 'text-gray-600'}`}>
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
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">QR <span className="gradient-text">ATTENDANCE</span></h2>
                                <div className="glass-card p-10 text-center">
                                    <QrCode size={120} className="text-emerald-400 mx-auto mb-16 opacity-60" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Your Attendance QR Code</h3>
                                    <p className="text-sm text-gray-600 mb-16">Show this at the cleanup drive for attendance verification</p>
                                    <div className="p-4 bg-white shadow-sm border border-gray-100 rounded-xl inline-block">
                                        <div className="text-xs text-gray-500 mb-1">User ID</div>
                                        <div className="text-sm font-mono text-emerald-400">{user.id}</div>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        {userDrives.filter(d => d.status === 'completed').map(drive => (
                                            <div key={drive.id} className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <span className="text-sm text-gray-900 flex-1 text-left">{drive.title}</span>
                                                <span className="text-xs text-emerald-400">✓ Attended</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'settings' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-black text-gray-900 mb-16 font-[var(--font-display)]">ACCOUNT <span className="gradient-text">SETTINGS</span></h2>
                                <div className="glass-card p-10 space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Full Name</label>
                                        <input defaultValue={user.name} className="w-full px-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-emerald-500/30 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Email</label>
                                        <input defaultValue={user.email} className="w-full px-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-emerald-500/30 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Role</label>
                                        <div className="px-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 capitalize">{user.role}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Member Since</label>
                                        <div className="px-4 py-3 bg-white shadow-sm border border-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500">{new Date(user.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    </div>
                                    <button className="btn-primary !py-3">Save Changes</button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
