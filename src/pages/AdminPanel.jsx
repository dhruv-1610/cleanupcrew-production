import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApiData } from '../hooks/useApiData';
import { api } from '../lib/api';
import {
    MapPin, Users, DollarSign, Shield,
    BarChart3, Plus, Edit, Trash2, CheckCircle2, X, QrCode,
    Upload, Eye, AlertTriangle, Globe
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

export default function AdminPanel() {
    const { user, isAuthenticated, loading: authLoading, apiOnline } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [spotStatuses, setSpotStatuses] = useState({});
    const [toast, setToast] = useState('');
    const navigate = useNavigate();

    // Create Drive modal
    const [showCreateDrive, setShowCreateDrive] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', date: '', fundingGoal: '', reportId: '', roles: [{ role: 'Cleaner', capacity: 5 }] });
    const [creating, setCreating] = useState(false);

    // Edit Drive modal
    const [editDrive, setEditDrive] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', status: '', fundingGoal: '', date: '', roles: [] });

    // Add Expense modal
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ driveId: '', category: 'equipment', amount: '', description: '' });
    const [addingExpense, setAddingExpense] = useState(false);
    const [editing, setEditing] = useState(false);

    const { data: apiDrives, loading: drivesLoading, refetch: refetchDrives } = useApiData('/api/drives', [], {
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res.drives || []);
            return arr.map(d => ({ ...d, id: d._id || d.id, severity: d.severity || 'medium', status: d.status === 'planned' ? 'upcoming' : d.status }));
        }
    });
    const { data: apiSpots, loading: spotsLoading, refetch: refetchSpots } = useApiData('/api/reports', [], {
        transform: (res) => {
            const arr = Array.isArray(res) ? res : (res.reports || []);
            return arr.map(r => ({ ...r, id: r._id || r.id, severity: r.severity || 'medium', status: r.status || 'reported' }));
        }
    });
    const { data: apiUsers, refetch: refetchUsers } = useApiData('/api/users', [], {
        transform: (res) => Array.isArray(res) ? res : (res.users || [])
    });
    const { data: apiExpenses, refetch: refetchExpenses } = useApiData('/api/expenses', [], {
        transform: (res) => Array.isArray(res) ? res : (res.expenses || [])
    });
    const { data: apiAttendance } = useApiData('/api/drives', [], {
        transform: (res) => {
            // We'll extract attendance from drives data
            return [];
        }
    });
    const allDrives = apiDrives || [];
    const allSpots = apiSpots || [];
    const allUsers = apiUsers || [];
    const allExpenses = apiExpenses || [];

    const handleAddExpense = async () => {
        if (!expenseForm.driveId || !expenseForm.amount) return showToast('Select a drive and enter amount');
        setAddingExpense(true);
        try {
            await api.post('/api/expenses', {
                driveId: expenseForm.driveId,
                category: expenseForm.category,
                amount: Number(expenseForm.amount),
                proofUrl: '/uploads/no-proof.png',
            });
            await refetchExpenses();
            setShowAddExpense(false);
            setExpenseForm({ driveId: '', category: 'equipment', amount: '', description: '' });
            showToast('Expense added!');
        } catch (e) { showToast(e.response?.data?.error?.message || 'Failed to add expense'); }
        setAddingExpense(false);
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm('Delete this expense?')) return;
        try {
            await api.delete(`/api/expenses/${id}`);
            await refetchExpenses();
            showToast('Expense deleted');
        } catch { showToast('Delete failed'); }
    };

    const handleDeleteUser = async (userId, name) => {
        if (!confirm(`Remove user "${name}"?`)) return;
        try {
            await api.delete(`/api/users/${userId}`);
            await refetchUsers();
            showToast('User removed');
        } catch { showToast('Delete failed'); }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated || !user) return <Navigate to="/login" />;

    const sideLinks = [
        { id: 'overview', label: 'Analytics', icon: BarChart3 },
        { id: 'drives', label: 'Manage Drives', icon: MapPin },
        { id: 'spots', label: 'Verify Spots', icon: AlertTriangle },
        { id: 'attendance', label: 'Attendance', icon: QrCode },
        { id: 'expenses', label: 'Expenses', icon: DollarSign },
        { id: 'users', label: 'Users', icon: Users },
    ];

    const handleApproveSpot = async (spotId) => {
        setSpotStatuses(prev => ({ ...prev, [spotId]: 'verified' }));
        try { 
            await api.patch(`/api/reports/${spotId}/verify`); 
            await refetchSpots();
            showToast('Spot verified'); 
        } catch (e) { showToast(e.response?.data?.error?.message || e.response?.data?.message || 'Failed to verify spot'); }
    };

    const handleRejectSpot = async (spotId) => {
        setSpotStatuses(prev => ({ ...prev, [spotId]: 'rejected' }));
        try { 
            await api.patch(`/api/reports/${spotId}/status`, { status: 'rejected' }); 
            await refetchSpots();
            showToast('Spot rejected'); 
        } catch (e) { showToast(e.response?.data?.error?.message || e.response?.data?.message || 'Failed to reject spot'); }
    };

    const handleDeleteDrive = async (driveId, title) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/api/drives/${driveId}`);
            await refetchDrives();
            showToast(`"${title}" deleted`);
        } catch { showToast('Delete failed'); }
    };

    const handleStatusChange = async (driveId, newStatus) => {
        try {
            await api.patch(`/api/drives/${driveId}`, { status: newStatus });
            await refetchDrives();
            showToast(`Drive status → ${newStatus}`);
        } catch (e) { showToast('Status update failed'); }
    };

    const handleCreateDrive = async () => {
        if (!createForm.title || !createForm.date || !createForm.reportId) return showToast('Fill all required fields');
        setCreating(true);
        try {
            const driveDate = new Date(createForm.date);
            if (driveDate <= new Date()) throw new Error('Date must be in the future');
            const maxVol = createForm.roles.reduce((s, r) => s + Number(r.capacity), 0);
            await api.post('/api/drives', {
                reportId: createForm.reportId,
                title: createForm.title,
                date: driveDate.toISOString(),
                fundingGoal: Number(createForm.fundingGoal) || 0,
                requiredRoles: createForm.roles.map(r => ({ role: r.role, capacity: Number(r.capacity) })),
                maxVolunteers: maxVol,
            });
            await refetchDrives();
            await refetchSpots();
            setShowCreateDrive(false);
            setCreateForm({ title: '', date: '', fundingGoal: '', reportId: '', roles: [{ role: 'Cleaner', capacity: 5 }] });
            showToast('Drive created!');
        } catch (e) { showToast(e.message || e.response?.data?.error?.message || 'Create failed'); }
        setCreating(false);
    };

    const handleEditDriveSubmit = async () => {
        if (!editForm.title || !editForm.date) return showToast('Title and Date are required');
        setEditing(true);
        try {
            await api.patch(`/api/drives/${editDrive.id}`, {
                title: editForm.title,
                status: editForm.status,
                fundingGoal: Number(editForm.fundingGoal) || 0,
                date: new Date(editForm.date).toISOString(),
                requiredRoles: editForm.roles.map(r => ({ role: r.role, capacity: Number(r.capacity) }))
            });
            await refetchDrives();
            setEditDrive(null);
            showToast('Drive updated!');
        } catch (e) { showToast(e.response?.data?.error?.message || e.response?.data?.message || 'Failed to update drive'); }
        setEditing(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/api/users/${userId}/role`, { role: newRole });
            await refetchUsers();
            showToast(`Role updated to ${newRole}`);
        } catch { showToast('Role update failed'); }
    };

    return (
        <div className="min-h-screen pt-20 pb-24">
            {/* Toast */}
            {toast && (
                <div className="fixed top-20 right-6 z-50 px-5 py-3 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-medium rounded-xl backdrop-blur-lg shadow-xl animate-pulse">
                    ✓ {toast}
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-64 flex-shrink-0">
                        <div className="glass-card p-5 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                    <Shield size={24} className="text-slate-900" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-100">Admin Panel</h3>
                                    <p className="text-xs text-slate-400">Full control center</p>
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

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'overview' && (
                            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                                <motion.h2 variants={fadeUp} className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">
                                    Platform <span className="gradient-text">Analytics</span>
                                </motion.h2>

                                <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { icon: Globe, label: 'Total Drives', value: allDrives.length },
                                        { icon: Users, label: 'Total Users', value: allUsers.length || '-' },
                                        { icon: DollarSign, label: 'Funds Raised', value: `₹${(allDrives.reduce((s,d) => s + (d.fundingRaised || d.currentFunding || 0), 0) / 100000).toFixed(1)}L` },
                                        { icon: AlertTriangle, label: 'Spot Reports', value: allSpots.length },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="glass-card p-5 text-center">
                                            <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/10 flex items-center justify-center">
                                                <Icon size={20} className="text-emerald-400" />
                                            </div>
                                            <div className="text-2xl font-extrabold text-slate-100 font-[var(--font-display)]">{value}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{label}</div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Additional stats */}
                                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="glass-card p-5">
                                        <h4 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Drive Status</h4>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Active', count: allDrives.filter(d => d.status === 'active').length, color: 'bg-emerald-400' },
                                                { label: 'Upcoming', count: allDrives.filter(d => d.status === 'upcoming').length, color: 'bg-blue-400' },
                                                { label: 'Completed', count: allDrives.filter(d => d.status === 'completed').length, color: 'bg-slate-400' },
                                            ].map(s => (
                                                <div key={s.label} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                                        <span className="text-sm text-slate-400">{s.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-200">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card p-5">
                                        <h4 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Spot Reports</h4>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Reported', count: allSpots.filter(s => s.status === 'reported').length, color: 'bg-red-400' },
                                                { label: 'Verified', count: allSpots.filter(s => s.status === 'verified').length, color: 'bg-orange-400' },
                                                { label: 'Cleaned', count: allSpots.filter(s => s.status === 'cleaned').length, color: 'bg-emerald-400' },
                                            ].map(s => (
                                                <div key={s.label} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                                        <span className="text-sm text-slate-400">{s.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-200">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card p-5">
                                        <h4 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Quick Actions</h4>
                                        <div className="space-y-2">
                                            <button onClick={() => setActiveSection('drives')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 border border-emerald-500/15 transition-colors">
                                                <Plus size={14} /> Create Drive
                                            </button>
                                            <button onClick={() => setActiveSection('expenses')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30 text-slate-400 text-sm font-medium hover:bg-slate-800/50 border border-slate-700/15 transition-colors">
                                                <Upload size={14} /> Upload Expenses
                                            </button>
                                            <button onClick={() => setActiveSection('spots')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30 text-slate-400 text-sm font-medium hover:bg-slate-800/50 border border-slate-700/15 transition-colors">
                                                <Eye size={14} /> View Reports
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeSection === 'drives' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-extrabold text-slate-100 font-[var(--font-display)]">Manage <span className="gradient-text">Drives</span></h2>
                                    <button onClick={() => setShowCreateDrive(true)} className="btn-primary flex items-center gap-2 !py-2 !px-4 !text-sm">
                                        <Plus size={16} /> New Drive
                                    </button>
                                </div>
                                {showCreateDrive && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCreateDrive(false)}>
                                        <div className="glass-card-heavy p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                                            <h3 className="text-lg font-bold text-slate-100">Create New Drive</h3>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Title *</label><input value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" /></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><label className="block text-xs text-slate-400 uppercase mb-1">Date *</label><input type="datetime-local" value={createForm.date} onChange={e => setCreateForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" /></div>
                                                <div><label className="block text-xs text-slate-400 uppercase mb-1">Funding Goal (₹)</label><input type="number" value={createForm.fundingGoal} onChange={e => setCreateForm(p => ({ ...p, fundingGoal: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" /></div>
                                            </div>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Linked Report * (verified spot)</label>
                                                <select value={createForm.reportId} onChange={e => setCreateForm(p => ({ ...p, reportId: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100">
                                                    <option value="">Select verified spot...</option>
                                                    {allSpots.filter(s => s.status === 'verified').map(s => <option key={s.id} value={s.id}>{(s.description || s.id).slice(0, 60)}</option>)}
                                                </select>
                                            </div>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Required Roles</label>
                                                {createForm.roles.map((r, i) => (
                                                    <div key={i} className="flex gap-2 mb-2">
                                                        <select value={r.role} onChange={e => { const roles = [...createForm.roles]; roles[i].role = e.target.value; setCreateForm(p => ({ ...p, roles })); }} className="flex-1 px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100">
                                                            {['Cleaner','Coordinator','Photographer','LogisticsHelper'].map(ro => <option key={ro}>{ro}</option>)}
                                                        </select>
                                                        <input type="number" min="1" value={r.capacity} onChange={e => { const roles = [...createForm.roles]; roles[i].capacity = e.target.value; setCreateForm(p => ({ ...p, roles })); }} className="w-20 px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" />
                                                        {createForm.roles.length > 1 && <button onClick={() => setCreateForm(p => ({ ...p, roles: p.roles.filter((_, j) => j !== i) }))} className="text-red-400">✕</button>}
                                                    </div>
                                                ))}
                                                <button onClick={() => setCreateForm(p => ({ ...p, roles: [...p.roles, { role: 'Cleaner', capacity: 5 }] }))} className="text-xs text-emerald-400 hover:underline">+ Add Role</button>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={handleCreateDrive} disabled={creating} className="btn-primary flex-1 !py-2">{creating ? 'Creating...' : 'Create Drive'}</button>
                                                <button onClick={() => setShowCreateDrive(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 bg-slate-800/30 border border-slate-700/15">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Edit Drive Modal */}
                                {editDrive && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditDrive(null)}>
                                        <div className="glass-card-heavy p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                                            <h3 className="text-lg font-bold text-slate-100">Edit Drive</h3>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Title *</label><input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" /></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><label className="block text-xs text-slate-400 uppercase mb-1">Date *</label><input type="datetime-local" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" /></div>
                                                <div><label className="block text-xs text-slate-400 uppercase mb-1">Funding Goal (₹)</label><input type="number" value={editForm.fundingGoal} onChange={e => setEditForm(p => ({ ...p, fundingGoal: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" /></div>
                                            </div>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Status</label>
                                                <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100">
                                                    <option value="planned">Planned</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Required Roles</label>
                                                {editForm.roles.map((r, i) => (
                                                    <div key={i} className="flex gap-2 mb-2">
                                                        <select value={r.role} onChange={e => { const roles = [...editForm.roles]; roles[i].role = e.target.value; setEditForm(p => ({ ...p, roles })); }} className="flex-1 px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100">
                                                            {['Cleaner','Coordinator','Photographer','LogisticsHelper'].map(ro => <option key={ro}>{ro}</option>)}
                                                        </select>
                                                        <input type="number" min="1" value={r.capacity} onChange={e => { const roles = [...editForm.roles]; roles[i].capacity = e.target.value; setEditForm(p => ({ ...p, roles })); }} className="w-20 px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" />
                                                        {editForm.roles.length > 1 && <button onClick={() => setEditForm(p => ({ ...p, roles: p.roles.filter((_, j) => j !== i) }))} className="text-red-400">✕</button>}
                                                    </div>
                                                ))}
                                                <button onClick={() => setEditForm(p => ({ ...p, roles: [...p.roles, { role: 'Cleaner', capacity: 5 }] }))} className="text-xs text-emerald-400 hover:underline">+ Add Role</button>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={handleEditDriveSubmit} disabled={editing} className="btn-primary flex-1 !py-2">{editing ? 'Saving...' : 'Save Changes'}</button>
                                                <button onClick={() => setEditDrive(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 bg-slate-800/30 border border-slate-700/15">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {allDrives.map(drive => (
                                        <div key={drive.id} className="glass-card p-5 flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${drive.status === 'active' ? 'bg-emerald-400' : drive.status === 'upcoming' || drive.status === 'planned' ? 'bg-blue-400' : 'bg-slate-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-100 truncate">{drive.title}</h3>
                                                <div className="flex gap-4 text-xs text-slate-400 mt-0.5">
                                                    <span>{new Date(drive.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                    <span>{drive.currentVolunteers || 0}/{drive.maxVolunteers || 0} vol</span>
                                                    <span>₹{((drive.currentFunding || drive.fundingRaised || 0) / 1000).toFixed(0)}k/{((drive.fundingGoal || 0) / 1000).toFixed(0)}k</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase text-slate-400">{drive.status}</span>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => { 
                                                    setEditDrive(drive); 
                                                    setEditForm({ 
                                                        title: drive.title, 
                                                        status: drive.status === 'upcoming' ? 'planned' : drive.status, 
                                                        fundingGoal: drive.fundingGoal || 0,
                                                        date: new Date(drive.date).toISOString().slice(0, 16),
                                                        roles: drive.requiredRoles?.map(r => ({ role: r.role, capacity: r.capacity })) || [{ role: 'Cleaner', capacity: 5 }]
                                                    }); 
                                                }} className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/15 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/15 transition-all" title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => navigate(`/drives/${drive.id}`)} className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/15 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/15 transition-all" title="View"><Eye size={14} /></button>
                                                <button onClick={() => handleDeleteDrive(drive.id, drive.title)} className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/15 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/15 transition-all" title="Delete"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'spots' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">Manage <span className="gradient-text">Spots</span></h2>
                                {/* Status summary */}
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    {[{l:'Reported',s:'reported',c:'text-red-400 bg-red-500/10'},{l:'Verified',s:'verified',c:'text-amber-400 bg-amber-500/10'},{l:'Drive Created',s:'drive_created',c:'text-blue-400 bg-blue-500/10'},{l:'Cleaned',s:'cleaned',c:'text-emerald-400 bg-emerald-500/10'}].map(x=>(
                                        <div key={x.s} className="glass-card p-3 text-center"><div className={`text-lg font-bold ${x.c.split(' ')[0]}`}>{allSpots.filter(s=>s.status===x.s).length}</div><div className="text-[10px] text-slate-400 uppercase mt-0.5">{x.l}</div></div>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    {allSpots.map(spot => {
                                        const st = spotStatuses[spot.id] || spot.status;
                                        return (
                                            <div key={spot.id} className="glass-card p-4">
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700/30 overflow-hidden flex-shrink-0">
                                                        <img src={spot.photoUrl || spot.photoUrls?.[0] || 'https://images.unsplash.com/photo-1618477461853-cf6ed80f4710?w=800&q=80'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${spot.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : spot.severity === 'medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{spot.severity}</span>
                                                                    <span className="text-xs text-slate-400">{new Date(spot.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                                </div>
                                                                <p className="text-sm text-slate-300 line-clamp-2">{spot.description}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                {/* Status changer */}
                                                                <select value={st} onChange={async e => { try { await api.patch(`/api/reports/${spot.id}/status`, { status: e.target.value }); setSpotStatuses(p=>({...p,[spot.id]:e.target.value})); await refetchSpots(); showToast(`Status → ${e.target.value}`); } catch(er) { showToast(er.response?.data?.error?.message || 'Failed'); } }} className="text-[10px] font-bold uppercase bg-slate-800/50 border border-slate-700/30 text-slate-300 rounded-lg px-2 py-1">
                                                                    <option value="reported">Reported</option><option value="verified">Verified</option><option value="drive_created">Drive Created</option><option value="cleaned">Cleaned</option><option value="rejected">Rejected</option>
                                                                </select>
                                                                {/* Quick verify */}
                                                                {st === 'reported' && <button onClick={() => handleApproveSpot(spot.id)} className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Verify"><CheckCircle2 size={14} /></button>}
                                                                {/* Delete */}
                                                                <button onClick={async () => { if(!confirm('Delete this report?')) return; try { await api.delete(`/api/reports/${spot.id}`); await refetchSpots(); showToast('Report deleted'); } catch { showToast('Delete failed'); } }} className="p-1.5 rounded-lg bg-slate-800/30 border border-slate-700/15 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 size={13} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {spot.location?.coordinates ? `${spot.location.coordinates[1].toFixed(4)}, ${spot.location.coordinates[0].toFixed(4)}` : 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {allSpots.length === 0 && <p className="text-center text-sm text-slate-400 p-8 glass-card">No spots reported yet.</p>}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'attendance' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-2xl font-extrabold text-slate-100 mb-6 font-[var(--font-display)]">QR <span className="gradient-text">Attendance</span></h2>
                                <div className="glass-card p-10 text-center mb-6">
                                    <QrCode size={60} className="text-emerald-400/30 mx-auto mb-6" />
                                    <h3 className="text-lg font-bold text-slate-100 mb-2">Scan QR Codes</h3>
                                    <p className="text-sm text-slate-400 mb-6">Use the scanner to verify volunteer attendance at events</p>
                                    <button className="btn-primary">Start Scanner</button>
                                </div>
                                <div className="glass-card p-6">
                                    <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Volunteer Bookings by Drive</h3>
                                    <div className="space-y-3">
                                        {allDrives.map(drive => {
                                            const roles = drive.requiredRoles || [];
                                            const totalBooked = roles.reduce((s, r) => s + (r.booked || 0), 0);
                                            const totalCap = roles.reduce((s, r) => s + r.capacity, 0);
                                            return (
                                                <div key={drive.id} className="p-4 bg-slate-800/30 border border-slate-700/15 rounded-xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-bold text-slate-200">{drive.title}</h4>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${drive.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/30 text-slate-400'}`}>{drive.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalCap > 0 ? (totalBooked/totalCap)*100 : 0}%` }} /></div>
                                                        <span className="text-xs text-slate-400 font-semibold">{totalBooked}/{totalCap}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {roles.map((r, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-700/30 text-slate-300 rounded-md">{r.role}: {r.booked||0}/{r.capacity}</span>)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {allDrives.length === 0 && <p className="text-center text-xs text-slate-500 py-4">No drives found.</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'expenses' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-extrabold text-slate-100 font-[var(--font-display)]">Manage <span className="gradient-text">Expenses</span></h2>
                                    <button onClick={() => setShowAddExpense(true)} className="btn-primary flex items-center gap-2 !py-2 !px-4 !text-sm">
                                        <Plus size={16} /> Add Expense
                                    </button>
                                </div>
                                {/* Add Expense Modal */}
                                {showAddExpense && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddExpense(false)}>
                                        <div className="glass-card-heavy p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                                            <h3 className="text-lg font-bold text-slate-100">Add New Expense</h3>
                                            <div><label className="block text-xs text-slate-400 uppercase mb-1">Drive *</label>
                                                <select value={expenseForm.driveId} onChange={e => setExpenseForm(p => ({ ...p, driveId: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100">
                                                    <option value="">Select drive...</option>
                                                    {allDrives.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><label className="block text-xs text-slate-400 uppercase mb-1">Category *</label>
                                                    <select value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100">
                                                        <option value="equipment">Equipment</option><option value="transport">Transport</option><option value="refreshments">Refreshments</option><option value="misc">Misc</option>
                                                    </select>
                                                </div>
                                                <div><label className="block text-xs text-slate-400 uppercase mb-1">Amount (₹) *</label>
                                                    <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} placeholder="5000" className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/30 text-slate-100" />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={handleAddExpense} disabled={addingExpense} className="btn-primary flex-1 !py-2">{addingExpense ? 'Adding...' : 'Add Expense'}</button>
                                                <button onClick={() => setShowAddExpense(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 bg-slate-800/30 border border-slate-700/15">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Summary cards */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-slate-100">₹{(allExpenses.reduce((s,e) => s + (e.amount||0), 0)).toLocaleString()}</div><div className="text-[10px] text-slate-400 uppercase mt-1">Total Spent</div></div>
                                    <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-emerald-400">{allExpenses.filter(e => e.isVerified).length}</div><div className="text-[10px] text-slate-400 uppercase mt-1">Verified</div></div>
                                    <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-yellow-400">{allExpenses.filter(e => !e.isVerified).length}</div><div className="text-[10px] text-slate-400 uppercase mt-1">Pending</div></div>
                                </div>
                                <div className="overflow-x-auto glass-card p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-700/15">
                                                <th className="pb-3 pr-4">Category</th>
                                                <th className="pb-3 pr-4">Drive</th>
                                                <th className="pb-3 pr-4 text-right">Amount</th>
                                                <th className="pb-3 pr-4">Date</th>
                                                <th className="pb-3 pr-4 text-center">Status</th>
                                                <th className="pb-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/10">
                                            {allExpenses.map((exp, i) => (
                                                <tr key={exp._id || exp.id || i} className="text-slate-400 hover:text-slate-200 hover:bg-emerald-500/3 transition-colors">
                                                    <td className="py-3 pr-4 text-sm font-medium text-slate-200 capitalize">{exp.category || '-'}</td>
                                                    <td className="py-3 pr-4 text-xs">{exp.driveId?.title || exp.driveId?.toString?.()?.slice(-6) || '-'}</td>
                                                    <td className="py-3 pr-4 text-right font-semibold text-slate-200">₹{(exp.amount || 0).toLocaleString()}</td>
                                                    <td className="py-3 pr-4 text-xs">{new Date(exp.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                    <td className="py-3 pr-4 text-center">
                                                        {exp.isVerified ? <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">✓ Verified</span> : <button onClick={async () => { try { await api.patch(`/api/expenses/${exp._id || exp.id}/verify`); refetchExpenses(); showToast('Verified'); } catch { showToast('Failed'); } }} className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md hover:bg-yellow-500/20 transition-colors cursor-pointer">Verify</button>}
                                                    </td>
                                                    <td className="py-3 text-center"><button onClick={() => handleDeleteExpense(exp._id || exp.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {allExpenses.length === 0 && <p className="text-center text-xs text-slate-500 mt-4 py-4">No expenses yet. Click "Add Expense" to create one.</p>}
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'users' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-extrabold text-slate-100 font-[var(--font-display)]">Manage <span className="gradient-text">Users</span></h2>
                                    <span className="text-sm text-slate-400">{allUsers.length} total users</span>
                                </div>
                                <div className="space-y-3">
                                    {allUsers.length > 0 ? allUsers.map(u => (
                                        <div key={u._id || u.id} className="glass-card p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-900 text-sm font-bold flex-shrink-0">
                                                {(u.profile?.name || u.name || u.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-100">{u.profile?.name || u.name || 'Unnamed'}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </div>
                                            <select value={u.role} onChange={e => handleRoleChange(u._id || u.id, e.target.value)} className="text-[10px] font-bold uppercase bg-slate-800/50 border border-slate-700/30 text-slate-300 rounded-lg px-2 py-1">
                                                <option value="public">Public</option>
                                                <option value="user">User</option>
                                                <option value="organizer">Organizer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${u.emailVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15'}`}>
                                                {u.emailVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                            <button onClick={() => handleDeleteUser(u._id || u.id, u.profile?.name || u.name || u.email)} className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/15 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete User"><Trash2 size={14} /></button>
                                        </div>
                                    )) : (
                                        <div className="glass-card p-10 text-center text-slate-400 text-sm">No users found.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
