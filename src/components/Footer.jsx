import { Link } from 'react-router-dom';
import { Heart, Globe, MessageCircle, Mail, MapPin, Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative mt-auto border-t border-slate-700/20">
            {/* Gradient glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {/* Ambient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(10,22,40,0.3)] to-[rgba(10,22,40,0.5)]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-5">
                            <img src="/images/logo-dark.png" alt="CleanupCrew" className="h-10 w-auto" />
                            <span className="text-lg font-bold font-[var(--font-display)]">
                                <span className="text-slate-100">CLEANUP</span>
                                <span className="gradient-text">CREW</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-5">
                            Transforming random goodwill into structured social action. One cleanup at a time.
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span>Made with</span>
                            <Heart size={12} className="text-emerald-400 fill-emerald-400" />
                            <span>for the planet</span>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-5 uppercase tracking-wider">Platform</h4>
                        <div className="space-y-2.5">
                            {[
                                { to: '/drives', label: 'Active Drives' },
                                { to: '/map', label: 'Explore Map' },
                                { to: '/leaderboard', label: 'Leaderboard' },
                                { to: '/transparency', label: 'Transparency Portal' },
                            ].map(l => (
                                <Link key={l.to} to={l.to} className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-5 uppercase tracking-wider">Resources</h4>
                        <div className="space-y-2.5">
                            {[
                                { to: '/register', label: 'Join as Volunteer' },
                                { to: '/register', label: 'Become a Donor' },
                                { to: '/report', label: 'Report a Spot' },
                            ].map((l, i) => (
                                <Link key={i} to={l.to} className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-5 uppercase tracking-wider">Connect</h4>
                        <div className="space-y-3">
                            <a href="mailto:hello@cleanupcrew.in" className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                                <Mail size={14} /> hello@cleanupcrew.in
                            </a>
                            <a href="https://maps.google.com/?q=Mumbai,India" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                                <MapPin size={14} /> Mumbai, India
                            </a>
                        </div>
                        <div className="flex gap-3 mt-4">
                            {[{ Icon: Globe, href: 'https://cleanupcrew.vercel.app', label: 'Website' }, { Icon: MessageCircle, href: 'https://twitter.com/cleanupcrew', label: 'Twitter' }].map(({ Icon, href, label }, i) => (
                                <a key={i} href={href} target="_blank" rel="noopener noreferrer" title={label} className="w-9 h-9 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-slate-700/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">© 2026 CleanupCrew. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="/transparency" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="/transparency" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Shield size={12} className="text-emerald-500" />
                            <span>100% Transparent</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
