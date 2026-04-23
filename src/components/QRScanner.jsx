import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Loader2 } from 'lucide-react';

export default function QRScanner({ onScan, onError, isScanning }) {
    const scannerRef = useRef(null);
    const html5QrCode = useRef(null);
    const [cameras, setCameras] = useState([]);
    const [activeCamera, setActiveCamera] = useState('');
    const [initError, setInitError] = useState(null);

    useEffect(() => {
        // Initialize available cameras
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setCameras(devices);
                // Prefer back camera
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
                setActiveCamera(backCamera ? backCamera.id : devices[0].id);
            } else {
                setInitError("No cameras found on this device.");
            }
        }).catch(err => {
            setInitError("Camera permissions denied or not available. Please allow camera access.");
            console.error("Error getting cameras", err);
        });

        return () => {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().catch(console.error);
            }
        };
    }, []);

    useEffect(() => {
        if (!activeCamera) return;

        if (isScanning) {
            html5QrCode.current = new Html5Qrcode("reader");
            
            html5QrCode.current.start(
                activeCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    // Success callback
                    if (onScan) onScan(decodedText);
                },
                (errorMessage) => {
                    // Ignored error (usually just "no qr code found in frame")
                }
            ).catch((err) => {
                console.error("Start failed", err);
                if (onError) onError("Failed to start camera. Please ensure no other apps are using it.");
            });
        } else {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().then(() => {
                    html5QrCode.current.clear();
                }).catch(console.error);
            }
        }

        return () => {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().catch(console.error);
            }
        };
    }, [isScanning, activeCamera, onScan, onError]);

    if (initError) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 text-sm">{initError}</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center">
            {cameras.length > 1 && (
                <div className="mb-4 w-full max-w-xs">
                    <select 
                        value={activeCamera} 
                        onChange={(e) => setActiveCamera(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 outline-none"
                    >
                        {cameras.map(c => (
                            <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>
                        ))}
                    </select>
                </div>
            )}
            
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border-4 border-slate-800">
                {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
                        <Loader2 size={32} className="text-slate-500 mb-2 animate-spin" />
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Initializing</p>
                    </div>
                )}
                <div id="reader" className="w-full" />
                
                {/* Scanner overlay effect */}
                <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.8)] pointer-events-none" />
            </div>
        </div>
    );
}
