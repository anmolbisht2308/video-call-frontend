'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronRight, Activity, Sparkles } from 'lucide-react';

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

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <>
            <motion.nav
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-transparent py-5'}`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <motion.div variants={itemVariants}>
                        <Link href="/" className="flex items-center gap-2 group relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Activity className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all duration-300">
                                Infiheal
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <motion.div key={link.href} variants={itemVariants}>
                                <Link
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-white group ${pathname === link.href ? 'text-white' : 'text-slate-400'}`}
                                >
                                    {pathname === link.href && (
                                        <motion.div
                                            layoutId="activePill"
                                            className="absolute inset-0 bg-white/10 rounded-full md:rounded-lg"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
                                    {pathname !== link.href && (
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200" />
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Auth Buttons (Desktop) */}
                    <motion.div variants={itemVariants} className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
                        ) : user ? (
                            <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 pr-2 pl-4 rounded-full border border-white/5 backdrop-blur-md">
                                {user.role === 'therapist' && (
                                    <Link href="/profile" className="text-xs font-medium text-slate-300 hover:text-white transition-colors uppercase tracking-wide">
                                        Manage Profile
                                    </Link>
                                )}
                                <div className="h-4 w-[1px] bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                                        title="Logout"
                                    >
                                        <LogOut size={16} />
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
                                    className="group relative px-5 py-2.5 rounded-xl text-sm font-bold overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative text-slate-900 flex items-center gap-2">
                                        Get Started <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Mobile Menu Toggle */}
                    <motion.button
                        variants={itemVariants}
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-slate-300 hover:text-white transition-colors relative z-50"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-slate-950 border-l border-white/10 z-50 p-8 flex flex-col shadow-2xl md:hidden"
                        >
                            <div className="absolute top-0 right-0 p-[200px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Menu</span>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-2 relative z-10">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + (i * 0.1) }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center justify-between text-lg font-medium p-4 rounded-2xl transition-all ${pathname === link.href ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 text-white shadow-lg shadow-blue-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                {pathname === link.href && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mb-0.5" />}
                                                {link.name}
                                            </span>
                                            <ChevronRight size={16} className={`transition-transform ${pathname === link.href ? 'translate-x-1 text-blue-400' : 'opacity-30'}`} />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/10 space-y-4 relative z-10">
                                {user ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-white/5 mb-4 shadow-xl">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-lg">{user.username}</p>
                                                <p className="text-xs text-slate-500 capitalize bg-slate-800 px-2 py-0.5 rounded w-fit mt-1">{user.role}</p>
                                            </div>
                                        </div>
                                        {user.role === 'therapist' && (
                                            <Link href="/profile" onClick={() => setIsOpen(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 mb-3 transition-colors">
                                                <User size={18} /> Manage Profile
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="space-y-3"
                                    >
                                        <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-3.5 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors border border-white/5">
                                            Log In
                                        </Link>
                                        <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full text-center py-3.5 rounded-xl font-bold bg-white text-slate-900 hover:bg-blue-50 transition-colors shadow-lg shadow-white/10">
                                            Get Started
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
