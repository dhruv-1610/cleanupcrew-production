import { useRef, useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApiData } from '../hooks/useApiData';
import { Download, ArrowLeft, Award } from 'lucide-react';

export default function Certificate() {
    const { driveId } = useParams();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const certRef = useRef(null);

    const { data: apiDrive, loading: driveLoading } = useApiData(`/api/drives/${driveId}`, null, {
        transform: (res) => {
            const d = res?.drive || res;
            if (!d || !d._id) return null;
            const imp = d.impactSummary;
            return {
                ...d,
                id: d._id || d.id,
                status: d.status === 'planned' ? 'upcoming' : d.status,
                location: { address: d.locationAddress || d.location?.address || 'Location TBD', ...d.location },
                organizer: d.organizer || 'CleanupCrew Team',
                impact: imp ? {
                    wasteKg: imp.wasteCollected || 0,
                    areaSqm: imp.areaCleaned || 0,
                    workHours: imp.workHours || 0,
                    volunteerCount: d.currentVolunteers ?? d.requiredRoles?.reduce((s, r) => s + (r.booked || 0), 0) ?? 0,
                } : null,
            };
        }
    });

    const drive = apiDrive;
    const hasParticipated = user?.attendances?.some(a => a.driveId === driveId) || user?.drives?.includes(driveId);

    const [certId, setCertId] = useState('');
    
    useEffect(() => {
        if (drive && user && hasParticipated) {
            setCertId(`CC-${(drive.id || drive._id || '').slice(-6).toUpperCase()}-${(user.id || user._id || '').slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`);
        }
    }, [drive, user, hasParticipated]);

    if (authLoading || driveLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated || !user) return <Navigate to="/login" />;

    if (!drive || drive.status !== 'completed' || !hasParticipated) {
        return (
            <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
                <div className="glass-card-heavy max-w-lg mx-auto p-12 text-center">
                    <Award size={64} className="mx-auto mb-6 text-emerald-400" />
                    <h2 className="text-3xl font-extrabold text-slate-100 mb-4 font-[var(--font-display)]">Certificate Unavailable</h2>
                    <p className="text-lg text-slate-400 mb-8">
                        {!hasParticipated 
                            ? "You did not participate in this drive, so a certificate cannot be issued." 
                            : "Certificates are only available for completed drives."}
                    </p>
                    <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const driveDate = new Date(drive.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const issueDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const userName = (user.name || user.email || 'Volunteer');

    const handlePrint = () => {
        const printContents = certRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CleanupCrew Certificate - ${userName}</title>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; }
                    @media print {
                        body { background: white; }
                        .cert-outer { box-shadow: none !important; }
                    }
                </style>
            </head>
            <body>
                ${printContents}
                <script>
                    setTimeout(() => { window.print(); }, 500);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="min-h-screen pt-28 pb-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Action Bar */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-medium text-sm transition-colors">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </Link>
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2 !px-6 !py-3">
                        <Download size={18} /> Download / Print
                    </button>
                </motion.div>

                {/* Certificate Preview */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <div ref={certRef}>
                        <div className="cert-outer" style={{
                            backgroundImage: "url('/images/cert-bg.png')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 16,
                            boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
                            maxWidth: 900,
                            minHeight: 560,
                            margin: '0 auto',
                            position: 'relative',
                            overflow: 'hidden',
                            fontFamily: "'Inter', sans-serif",
                        }}>
                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 2, padding: '48px 52px 40px 52px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                                        {/* Header row: Certificate title + Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                            <div>
                                                <h1 style={{
                                                    fontFamily: "'Playfair Display', serif",
                                                    fontSize: 56,
                                                    fontWeight: 400,
                                                    fontStyle: 'italic',
                                                    color: '#d4af37',
                                                    lineHeight: 1,
                                                    letterSpacing: 2,
                                                    textShadow: '0 2px 10px rgba(212,175,55,0.3)',
                                                }}>
                                                    Certificate
                                                </h1>
                                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
                                                    <span style={{
                                                        fontFamily: "'Inter', sans-serif",
                                                        fontSize: 11,
                                                        letterSpacing: 5,
                                                        color: '#d4af37',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 600,
                                                        padding: '4px 14px',
                                                        border: '1.5px solid rgba(212,175,55,0.5)',
                                                        borderRadius: 4,
                                                    }}>
                                                        of Participation
                                                    </span>
                                                    <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
                                                </div>
                                            </div>

                                            {/* Badge/Seal */}
                                            <div style={{
                                                width: 100,
                                                height: 100,
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {/* Gold starburst */}
                                                <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                                                    {Array.from({ length: 16 }).map((_, i) => {
                                                        const angle = (i * 360) / 16;
                                                        const rad = (angle * Math.PI) / 180;
                                                        const outerR = 48;
                                                        const innerR = 38;
                                                        const nextAngle = ((i + 1) * 360) / 16;
                                                        const midAngle = (angle + nextAngle) / 2;
                                                        const midRad = (midAngle * Math.PI) / 180;
                                                        const x1 = 50 + outerR * Math.cos(rad);
                                                        const y1 = 50 + outerR * Math.sin(rad);
                                                        const mx = 50 + innerR * Math.cos(midRad);
                                                        const my = 50 + innerR * Math.sin(midRad);
                                                        const x2 = 50 + outerR * Math.cos((nextAngle * Math.PI) / 180);
                                                        const y2 = 50 + outerR * Math.sin((nextAngle * Math.PI) / 180);
                                                        return <polygon key={i} points={`50,50 ${x1},${y1} ${mx},${my} ${x2},${y2}`} fill="#d4af37" />;
                                                    })}
                                                </svg>
                                                <div style={{
                                                    width: 72, height: 72, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #0a2e1f, #134e33)',
                                                    border: '2px solid #d4af37',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    position: 'relative', zIndex: 2,
                                                }}>
                                                    <span style={{ fontSize: 7, color: '#d4af37', letterSpacing: 2, fontWeight: 600 }}>★★★★★</span>
                                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#d4af37', fontWeight: 800, lineHeight: 1.2 }}>CLEANUP</span>
                                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 10, color: '#f0d060', fontWeight: 700, lineHeight: 1 }}>CREW</span>
                                                    <span style={{ fontSize: 6, color: '#d4af37', letterSpacing: 2, fontWeight: 600, marginTop: 1 }}>★★★★★</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Proudly Presented To */}
                                        <div style={{ marginBottom: 8 }}>
                                            <p style={{
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: 13,
                                                color: 'rgba(212,175,55,0.7)',
                                                letterSpacing: 4,
                                                textTransform: 'uppercase',
                                                fontWeight: 500,
                                            }}>
                                                Proudly Presented To
                                            </p>
                                        </div>

                                        {/* Name */}
                                        <div style={{ marginBottom: 20 }}>
                                            <h2 style={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontSize: 44,
                                                color: '#d4af37',
                                                fontWeight: 700,
                                                lineHeight: 1.2,
                                                letterSpacing: 1,
                                                textShadow: '0 2px 8px rgba(212,175,55,0.2)',
                                            }}>
                                                {userName}
                                            </h2>
                                            <div style={{ width: 200, height: 2, background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.2))', marginTop: 4, borderRadius: 2 }} />
                                        </div>

                                        {/* Description */}
                                        <p style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: 13,
                                            color: 'rgba(255,255,255,0.65)',
                                            lineHeight: 1.8,
                                            maxWidth: 480,
                                            marginBottom: 28,
                                        }}>
                                            For outstanding volunteering and dedicated participation in the community cleanup drive 
                                            <strong style={{ color: '#d4af37' }}> "{drive.title}"</strong> held on 
                                            <strong style={{ color: 'rgba(255,255,255,0.85)' }}> {driveDate}</strong> at 
                                            <strong style={{ color: 'rgba(255,255,255,0.85)' }}> {(drive.location?.address || 'Location').split(',')[0]}</strong>.
                                            {drive.impact && (
                                                <span> Together, volunteers collected <strong style={{ color: '#d4af37' }}>{drive.impact.wasteKg}kg</strong> of waste,
                                                cleaned <strong style={{ color: '#d4af37' }}>{drive.impact.areaSqm}m²</strong> of area,
                                                and contributed <strong style={{ color: '#d4af37' }}>{drive.impact.workHours} hours</strong> of work.</span>
                                            )}
                                        </p>

                                        {/* Impact stats row */}
                                        {drive.impact && (
                                            <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                                                {[
                                                    { value: `${drive.impact.wasteKg}kg`, label: 'Waste Collected' },
                                                    { value: `${drive.impact.areaSqm}m²`, label: 'Area Cleaned' },
                                                    { value: `${drive.impact.workHours}h`, label: 'Work Hours' },
                                                    { value: drive.impact.volunteerCount, label: 'Volunteers' },
                                                ].map((stat, i) => (
                                                    <div key={i} style={{
                                                        padding: '10px 18px',
                                                        background: 'rgba(212,175,55,0.08)',
                                                        border: '1px solid rgba(212,175,55,0.25)',
                                                        borderRadius: 8,
                                                        textAlign: 'center',
                                                        minWidth: 90,
                                                    }}>
                                                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#d4af37', fontWeight: 700 }}>{stat.value}</div>
                                                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Signatures + Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            {/* Signature 1 */}
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    fontFamily: "'Great Vibes', cursive",
                                                    fontSize: 22,
                                                    color: '#d4af37',
                                                    marginBottom: 4,
                                                }}>
                                                    CleanupCrew
                                                </div>
                                                <div style={{ width: 140, height: 1.5, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', marginBottom: 6 }} />
                                                <span style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: 9,
                                                    color: 'rgba(212,175,55,0.7)',
                                                    letterSpacing: 3,
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600,
                                                }}>
                                                    Platform Authority
                                                </span>
                                            </div>

                                            {/* Certificate ID */}
                                            <div style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: 8,
                                                    color: 'rgba(255,255,255,0.35)',
                                                    letterSpacing: 1,
                                                    display: 'block',
                                                    marginBottom: 2,
                                                }}>
                                                    CERTIFICATE ID
                                                </span>
                                                <span style={{
                                                    fontFamily: "'Inter', monospace",
                                                    fontSize: 9,
                                                    color: 'rgba(212,175,55,0.6)',
                                                    fontWeight: 600,
                                                    letterSpacing: 1,
                                                }}>
                                                    {certId}
                                                </span>
                                                <span style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: 8,
                                                    color: 'rgba(255,255,255,0.3)',
                                                    display: 'block',
                                                    marginTop: 2,
                                                }}>
                                                    Issued: {issueDate}
                                                </span>
                                            </div>

                                            {/* Signature 2 */}
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    fontFamily: "'Great Vibes', cursive",
                                                    fontSize: 22,
                                                    color: '#d4af37',
                                                    marginBottom: 4,
                                                }}>
                                                    {drive.organizer}
                                                </div>
                                                <div style={{ width: 140, height: 1.5, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', marginBottom: 6 }} />
                                                <span style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: 9,
                                                    color: 'rgba(212,175,55,0.7)',
                                                    letterSpacing: 3,
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600,
                                                }}>
                                                    Drive Organizer
                                                </span>
                                            </div>
                                        </div>

                                        {/* Verification footer */}
                                        <div style={{
                                            marginTop: 20,
                                            paddingTop: 12,
                                            borderTop: '1px solid rgba(212,175,55,0.15)',
                                            textAlign: 'center',
                                        }}>
                                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>
                                                VERIFIED ON CLEANUPCREW.VERCEL.APP • THIS CERTIFICATE ACKNOWLEDGES VOLUNTARY PARTICIPATION
                                            </span>
                                        </div>
                                    </div>

                        </div>
                    </div>
                </motion.div>

                {/* Extra Info */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
                    <p className="text-slate-300 font-medium text-sm mb-2">🖨️ Click "Download / Print" to save as PDF or print directly</p>
                    <p className="text-slate-500 text-xs">Use your browser's "Save as PDF" option in the print dialog for a digital copy</p>
                </motion.div>
            </div>
        </div>
    );
}
