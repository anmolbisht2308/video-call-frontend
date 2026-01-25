'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Users, Search, Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const createRoom = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to create room');
      const data = await res.json();
      router.push(`/room/${data.roomId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create room.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <Activity className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-10">

      {/* Main Dashboard Grid */}
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
        Welcome back, {user.username}
      </h1>
      <p className="text-slate-400 -mt-8 mb-4">Ready for your session today?</p>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1: Join Meeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-3xl flex flex-col justify-between hover:border-slate-600 transition-colors group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div>
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Video size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Instant Meeting</h2>
            <p className="text-slate-400 mb-8">Join a secure P2P video session with your Therapist or Client.</p>
          </div>

          <form onSubmit={joinRoom} className="relative z-10 space-y-4">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
              <Video size={20} /> Join Room
            </button>
          </form>
        </motion.div>

        {/* Card 2: Find Therapist */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-3xl flex flex-col justify-between hover:border-slate-600 transition-colors relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div>
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
              <Search size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Find a Therapist</h2>
            <p className="text-slate-400 mb-8">Browse our network of professional therapists and book a session.</p>
          </div>

          <button
            onClick={() => router.push('/therapists')}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Browse Specialists
          </button>
        </motion.div>

        {/* Card 3: Actions / History */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 rounded-3xl flex flex-col justify-between hover:border-slate-600 transition-colors relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div>
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <Calendar size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Activity</h2>
            <p className="text-slate-400 mb-4">Manage your sessions and history.</p>
          </div>

          <div className="space-y-3 mt-auto">
            {user.role === 'therapist' && (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  Manage Profile
                </button>

                <button
                  onClick={createRoom}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  Create New Session
                </button>
              </>
            )}
            <button
              onClick={() => router.push('/history')}
              className="w-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium py-3 rounded-xl transition-all"
            >
              View History
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
