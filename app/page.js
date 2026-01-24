'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Users, LogOut } from 'lucide-react';
import styles from './page.module.css';
import { useAuth } from '@/context/AuthContext';

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

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    router.push(`/room/${newRoomId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-400">
            Logged in as <span className="text-white font-bold">{user.username}</span>
          </div>
          <button onClick={logout} className="text-red-400 hover:text-red-300 transition">
            <LogOut size={20} />
          </button>
        </div>

        <div className={styles.iconWrapper}>
          <Video size={48} />
        </div>
        <h1 className={styles.title}>P2P Video Chat</h1>
        <p className={styles.subtitle}>Secure, 1-on-1 video calls.</p>

        <form onSubmit={joinRoom} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.buttonPrimary}>
            <Users size={20} />
            Join Room
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {user.role === 'therapist' && (
            <button onClick={createRoom} className={styles.buttonSecondary}>
              Create New Room
            </button>
          )}

          <button onClick={() => router.push('/history')} className="w-full py-3 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition flex items-center justify-center gap-2">
            View Meeting History
          </button>
        </div>
      </div>
    </div>
  );
}
