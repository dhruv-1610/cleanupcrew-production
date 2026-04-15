import { Link } from 'react-router-dom';
import { Heart, Globe, MessageCircle, Mail, MapPin, Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative bg-gray-50 border-t border-gray-200 mt-auto">
            {/* Green glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-16">
                            <img src="/images/logo-dark.png" alt="CleanupCrew" className="h-16 w-auto" />
                            <span className="text-lg font-bold font-[var(--font-display)]">
                                <span className="text-gray-900">CLEANUP</span>
                                <span className="text-emerald-400">CREW</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-16">
                            Transforming random goodwill into structured social action. One cleanup at a time.
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span>Made with</span>
                            <Heart size={12} className="text-emerald-500 fill-emerald-500" />
                            <span>for the planet</span>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-16 uppercase tracking-wider">Platform</h4>
                        <div className="space-y-2.5">
                            {[
                                { to: '/drives', label: 'Active Drives' },
                                { to: '/map', label: 'Explore Map' },
                                { to: '/leaderboard', label: 'Leaderboard' },
                                { to: '/transparency', label: 'Transparency Portal' },
                            ].map(l => (
                                <Link key={l.to} to={l.to} className="block text-sm text-gray-600 hover:text-emerald-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-16 uppercase tracking-wider">Resources</h4>
                        <div className="space-y-2.5">
                            {[
                                { to: '/register', label: 'Join as Volunteer' },
                                { to: '/register', label: 'Become a Donor' },
                                { to: '/report', label: 'Report a Spot' },
                            ].map((l, i) => (
                                <Link key={i} to={l.to} className="block text-sm text-gray-600 hover:text-emerald-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-16 uppercase tracking-wider">Connect</h4>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-400 transition-colors">
                                <Mail size={14} /> hello@cleanupcrew.in
                            </a>
                            <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-400 transition-colors">
                                <MapPin size={14} /> Mumbai, India
                            </a>
                        </div>
                        <div className="flex gap-3 mt-4">
                            {[Globe, MessageCircle].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white shadow-sm border border-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-12">
                    <p className="text-xs text-gray-600">© 2026 CleanupCrew. All rights reserved.</p>
                    <div className="flex items-center gap-12">
                        <a href="#" className="text-xs text-gray-600 hover:text-gray-500 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-600 hover:text-gray-500 transition-colors">Terms of Service</a>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Shield size={12} className="text-emerald-600" />
                            <span>100% Transparent</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
