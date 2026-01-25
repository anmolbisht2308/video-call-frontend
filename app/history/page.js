'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Calendar, Clock, User, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function History() {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchHistory();
        }
    }, [user, loading, router]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/rooms/history', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (loading || loadingHistory) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                <Activity className="animate-spin mr-2" /> Loading History...
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] p-6 md:p-12 max-w-5xl mx-auto flex flex-col gap-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
            >
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft />
                </button>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Meeting History
                </h1>
            </motion.div>

            {history.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-12 rounded-3xl text-center flex flex-col items-center justify-center text-slate-500 gap-4"
                >
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                        <Calendar size={28} />
                    </div>
                    <p>No meeting history found.</p>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {history.map((room, index) => (
                            <motion.div
                                key={room._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:bg-white/5 transition-colors border border-white/5"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white">Room: <span className="font-mono text-indigo-400">{room.roomId}</span></h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${room.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'}`}>
                                            {room.isActive ? 'Active' : 'Ended'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {new Date(room.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[200px]">
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Participants</div>
                                    <div className="flex flex-wrap gap-2">
                                        {room.participants.map((p, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg text-sm text-slate-300 border border-white/5">
                                                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                    {p.user ? p.user.username.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                {p.user ? p.user.username : 'Unknown'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
