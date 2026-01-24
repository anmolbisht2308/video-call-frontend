'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, Activity } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await register(username, email, password, role);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
                <div className="w-full max-w-md relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-slate-400">Join our community today.</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="client">Client</option>
                                        <option value="therapist">Therapist</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? <Activity className="animate-spin" size={20} /> : 'Create Account'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 text-center text-slate-400"
                    >
                        Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden md:flex flex-col items-center justify-center p-12 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute bottom-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mb-16" />
                    <div className="absolute top-0 left-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mt-16" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 glass p-10 rounded-3xl max-w-lg text-center"
                >
                    <div className="w-16 h-16 bg-gradient-to-bl from-emerald-500 to-indigo-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Activity className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Start Your Journey</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Join thousands of users who are prioritizing their mental well-being with our secure and accessible platform.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
