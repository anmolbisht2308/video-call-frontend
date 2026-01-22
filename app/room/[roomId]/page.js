'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users } from 'lucide-react';
import styles from './room.module.css';

export default function Room() {
    const { roomId } = useParams();
    const router = useRouter();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    const {
        localStream,
        remoteStream,
        startLocalStream,
        connectionStatus,
        toggleMic,
        toggleCamera,
        userCount,
        notifications
    } = useWebRTC(roomId);

    useEffect(() => {
        startLocalStream();
    }, []);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleToggleMic = () => {
        toggleMic();
        setIsMicOn(!isMicOn);
    };

    const handleToggleCamera = () => {
        toggleCamera();
        setIsCameraOn(!isCameraOn);
    };

    const handleLeave = () => {
        router.push('/');
    };

    return (
        <div className={styles.roomContainer}>
            {/* Notifications Toast */}
            <div className={styles.toastContainer}>
                {notifications.map(n => (
                    <div key={n.id} className={styles.toast}>
                        {n.msg}
                    </div>
                ))}
            </div>

            <div className={styles.header}>
                <h2>Room: {roomId}</h2>
                <div className={styles.headerRight}>
                    <div className={styles.userCount}>
                        <Users size={18} />
                        <span>{userCount} Online</span>
                    </div>
                    <div className={`${styles.status} ${styles[connectionStatus]}`}>
                        {connectionStatus === 'connected' ? 'Signal OK' : 'Connecting...'}
                    </div>
                </div>
            </div>

            <div className={styles.videoGrid}>
                <div className={styles.videoWrapper}>
                    <video ref={localVideoRef} autoPlay playsInline muted className={styles.video} />
                    <span className={styles.label}>You</span>
                </div>

                <div className={styles.videoWrapper}>
                    {remoteStream ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className={styles.video} />
                    ) : (
                        <div className={styles.placeholder}>
                            <p>Waiting for peer...</p>
                        </div>
                    )}
                    <span className={styles.label}>Peer</span>
                </div>
            </div>

            <div className={styles.controls}>
                <button onClick={handleToggleMic} className={`${styles.controlBtn} ${!isMicOn ? styles.off : ''}`}>
                    {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button onClick={handleToggleCamera} className={`${styles.controlBtn} ${!isCameraOn ? styles.off : ''}`}>
                    {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
                <button onClick={() => { }} className={styles.controlBtn} disabled title="Screen Share (Coming Soon)">
                    <Monitor size={24} />
                </button>
                <button onClick={handleLeave} className={`${styles.controlBtn} ${styles.endCall}`}>
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
}
