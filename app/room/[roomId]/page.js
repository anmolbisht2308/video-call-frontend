'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users, MessageSquare, Send, X } from 'lucide-react';
import styles from './room.module.css';

export default function Room() {
    const { roomId } = useParams();
    const router = useRouter();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const messagesEndRef = useRef(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');

    const {
        localStream,
        remoteStream,
        startLocalStream,
        connectionStatus,
        toggleMic,
        toggleCamera,
        userCount,
        notifications,
        messages,
        sendMessage
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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className={styles.roomContainer}>
            {/* Main Content Area */}
            <div className={styles.mainContent}>
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
                    <button onClick={() => setIsChatOpen(!isChatOpen)} className={`${styles.controlBtn} ${isChatOpen ? styles.active : ''}`}>
                        <MessageSquare size={24} />
                    </button>
                    <button onClick={handleLeave} className={`${styles.controlBtn} ${styles.endCall}`}>
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>

            {/* Chat Side Panel */}
            <div className={`${styles.chatContainer} ${!isChatOpen ? styles.hidden : ''}`}>
                <div className={styles.chatHeader}>
                    <span>In-Call Messages</span>
                    <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.chatMessages}>
                    {messages.length === 0 && (
                        <div className="text-gray-500 text-center mt-4 text-sm">No messages yet</div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`${styles.message} ${msg.isSelf ? styles.self : styles.other}`}>
                            <div>{msg.message}</div>
                            <span className={styles.messageTime}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Send a message..."
                        className={styles.chatInput}
                    />
                    <button type="submit" className={styles.sendBtn}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
