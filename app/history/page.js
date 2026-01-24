'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '../page.module.css';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: '800px', width: '95%' }}>
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                        <ArrowLeft />
                    </button>
                    <h1 className={styles.title} style={{ margin: 0 }}>Meeting History</h1>
                </div>

                {history.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        No meeting history found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                        {history.map((room) => (
                            <div key={room._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-lg font-semibold text-white">Room: {room.roomId}</div>
                                        <div className="text-sm text-gray-400 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(room.createdAt).toLocaleDateString()} at {new Date(room.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs ${room.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                                        {room.isActive ? 'Active' : 'Ended'}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Participants</div>
                                    <div className="flex flex-wrap gap-2">
                                        {room.participants.map((p, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded text-sm text-gray-200">
                                                <User size={12} />
                                                {p.user ? p.user.username : 'Unknown'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
