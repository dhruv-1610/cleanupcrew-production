import { useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { mockDrives } from '../data/mockData';
import { Download, ArrowLeft, Leaf, Award, Clock, MapPin, Users, Calendar } from 'lucide-react';

export default function Certificate() {
    const { driveId } = useParams();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const certRef = useRef(null);

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated || !user) return <Navigate to="/login" />;

    const drive = mockDrives.find(d => d.id === driveId);
    if (!drive || drive.status !== 'completed') {
        return (
            <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
                <div className="glass-card-heavy max-w-lg mx-auto p-12 text-center">
                    <Award size={64} className="mx-auto mb-6 text-emerald-400" />
                    <h2 className="text-3xl font-extrabold text-slate-100 mb-4 font-[var(--font-display)]">Certificate Unavailable</h2>
                    <p className="text-lg text-slate-400 mb-8">Certificates are only available for completed drives.</p>
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
    const certId = `CC-${(drive.id || drive._id || '').slice(-6).toUpperCase()}-${(user.id || user._id || '').slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const handlePrint = () => {
        const printContents = certRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CleanupCrew Certificate - ${user.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; }
                    @media print {
                        body { background: white; }
                        .cert-container { box-shadow: none !important; }
                    }
                    ${getCertStyles()}
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
                        <div className="cert-container" style={certContainerStyle}>
                            {/* Outer decorative border */}
                            <div style={certOuterBorderStyle}>
                                {/* Inner border */}
                                <div style={certInnerBorderStyle}>
                                    {/* Corner decorations */}
                                    <div style={{ ...cornerStyle, top: 12, left: 12 }}>🌿</div>
                                    <div style={{ ...cornerStyle, top: 12, right: 12 }}>🌿</div>
                                    <div style={{ ...cornerStyle, bottom: 12, left: 12 }}>🌿</div>
                                    <div style={{ ...cornerStyle, bottom: 12, right: 12 }}>🌿</div>

                                    {/* Header */}
                                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
                                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, letterSpacing: 8, color: '#0f766e', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                                            CLEANUPCREW INDIA
                                        </div>
                                        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 42, color: '#0d9488', textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: 2, fontWeight: 800 }}>
                                            CERTIFICATE OF<br />PARTICIPATION
                                        </h1>
                                        <div style={{ width: 120, height: 4, background: 'linear-gradient(90deg, #0d9488, #06b6d4)', margin: '16px auto 0', borderRadius: 3 }} />
                                    </div>

                                    {/* Body */}
                                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#134e4a', marginBottom: 8 }}>
                                            This certificate is proudly presented to
                                        </p>
                                        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 40, color: '#0d9488', borderBottom: '3px solid #0d9488', display: 'inline-block', padding: '4px 32px 8px', marginBottom: 8, letterSpacing: 1, fontWeight: 800 }}>
                                            {user.name.toUpperCase()}
                                        </h2>
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#134e4a', marginTop: 12, lineHeight: 1.8 }}>
                                            for outstanding volunteering and participation in the cleanup drive
                                        </p>
                                    </div>

                                    {/* Drive Details */}
                                    <div style={{ background: '#f0fdfa', border: '2px solid #0d9488', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, color: '#0d9488', textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', fontWeight: 700 }}>
                                            {drive.title}
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div style={statBoxStyle}>
                                                <span style={statLabelStyle}>📍 LOCATION</span>
                                                <span style={statValueStyle}>{drive.location.address.split(',')[0]}</span>
                                            </div>
                                            <div style={statBoxStyle}>
                                                <span style={statLabelStyle}>📅 DATE</span>
                                                <span style={statValueStyle}>{driveDate}</span>
                                            </div>
                                            {drive.impact && (
                                                <>
                                                    <div style={statBoxStyle}>
                                                        <span style={statLabelStyle}>🗑️ WASTE COLLECTED</span>
                                                        <span style={statValueStyle}>{drive.impact.wasteKg} KG</span>
                                                    </div>
                                                    <div style={statBoxStyle}>
                                                        <span style={statLabelStyle}>⏱️ TOTAL HOURS</span>
                                                        <span style={statValueStyle}>{drive.impact.workHours} HOURS</span>
                                                    </div>
                                                    <div style={statBoxStyle}>
                                                        <span style={statLabelStyle}>👥 VOLUNTEERS</span>
                                                        <span style={statValueStyle}>{drive.impact.volunteerCount} PEOPLE</span>
                                                    </div>
                                                    <div style={statBoxStyle}>
                                                        <span style={statLabelStyle}>📐 AREA CLEANED</span>
                                                        <span style={statValueStyle}>{drive.impact.areaSqm} SQ.M</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Organizer & Signature */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: 160, borderBottom: '2px solid #134e4a', marginBottom: 8, paddingBottom: 4 }}>
                                                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#0d9488', fontWeight: 700 }}>CLEANUPCREW</span>
                                            </div>
                                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#134e4a', fontWeight: 600 }}>PLATFORM AUTHORITY</span>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: 160, borderBottom: '2px solid #134e4a', marginBottom: 8, paddingBottom: 4 }}>
                                                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#0d9488', fontWeight: 700 }}>{drive.organizer.toUpperCase()}</span>
                                            </div>
                                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#134e4a', fontWeight: 600 }}>DRIVE ORGANIZER</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ textAlign: 'center', borderTop: '2px dashed #0d9488', paddingTop: 12 }}>
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#134e4a' }}>
                                            Certificate ID: <strong>{certId}</strong> &nbsp;|&nbsp; Issued: <strong>{issueDate}</strong> &nbsp;|&nbsp; Verified on cleanupcrew.vercel.app
                                        </p>
                                    </div>
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

// --- Inline Styles for Print-safe rendering ---
const certContainerStyle = {
    background: '#ffffff',
    borderRadius: 20,
    padding: 12,
    boxShadow: '0 10px 60px rgba(0,0,0,0.4)',
    border: '2px solid #0d9488',
    maxWidth: 800,
    margin: '0 auto',
};

const certOuterBorderStyle = {
    border: '2px solid #14b8a6',
    borderRadius: 16,
    padding: 8,
};

const certInnerBorderStyle = {
    border: '2px dashed #5eead4',
    borderRadius: 12,
    padding: 32,
    position: 'relative',
};

const cornerStyle = {
    position: 'absolute',
    fontSize: 24,
};

const statBoxStyle = {
    background: '#ffffff',
    border: '1px solid #14b8a6',
    borderRadius: 12,
    padding: '12px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
};

const statLabelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    color: '#134e4a',
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
};

const statValueStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18,
    color: '#0d9488',
    fontWeight: 700,
};

function getCertStyles() {
    return `
        .cert-container {
            background: #ffffff;
            border-radius: 20px;
            padding: 12px;
            border: 2px solid #0d9488;
            max-width: 800px;
            margin: 0 auto;
        }
        @media print {
            .cert-container {
                box-shadow: none;
                border: 2px solid #0d9488;
            }
        }
    `;
}
