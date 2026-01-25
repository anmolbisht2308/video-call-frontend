'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronRight, Activity } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Find Therapists', href: '/therapists' },
        ...(user ? [{ name: 'History', href: '/history' }] : []),
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                            <Activity className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Infiheal
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-blue-400 ${pathname === link.href ? 'text-white' : 'text-slate-400'}`}
                            >
                                {link.name}
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="underline"
                                        className="h-0.5 bg-blue-500 w-full mt-1 rounded-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                {user.role === 'therapist' && (
                                    <Link href="/profile" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                        Manage Profile
                                    </Link>
                                )}
                                <div className="h-8 w-[1px] bg-white/10" />
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-white">{user.username}</span>
                                    <button
                                        onClick={logout}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-slate-950 border-l border-white/10 z-50 p-6 flex flex-col shadow-2xl md:hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-bold text-white">Menu</span>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center justify-between text-lg font-medium p-2 rounded-xl transition-colors ${pathname === link.href ? 'bg-white/5 text-white' : 'text-slate-400'}`}
                                    >
                                        {link.name}
                                        <ChevronRight size={16} className="opacity-50" />
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/10 space-y-4">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-white/5 mb-4">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.username}</p>
                                                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        {user.role === 'therapist' && (
                                            <Link href="/profile" className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                                                <User size={18} /> Manage Profile
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <Link href="/login" className="block w-full text-center py-3 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors">
                                            Log In
                                        </Link>
                                        <Link href="/register" className="block w-full text-center py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
