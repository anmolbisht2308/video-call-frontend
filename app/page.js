'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Users } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
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

        <button onClick={createRoom} className={styles.buttonSecondary}>
          Create New Room
        </button>
      </div>
    </div>
  );
}
