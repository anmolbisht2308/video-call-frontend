'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Send, X, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Room() {
    const { roomId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
    } = useWebRTC(roomId, user);

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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="h-screen w-full bg-slate-950 flex relative overflow-hidden font-sans text-slate-100 selection:bg-indigo-500/30">

            {/* Header Overlay */}
            <motion.div
                initial={{ y: -100 }} animate={{ y: 0 }}
                className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-start pointer-events-none"
            >
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-xl pointer-events-auto flex items-center gap-4">
                    <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Room Code</h2>
                        <p className="text-xl font-mono text-white tracking-widest">{roomId}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.4)]' : 'bg-amber-500 animate-pulse'}`} />
                </div>

                <div className="flex flex-col items-end gap-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl pointer-events-auto">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Users size={16} />
                        <span>{userCount} Participant{userCount !== 1 && 's'}</span>
                    </div>
                </div>
            </motion.div>

            {/* Notifications */}
            <div className="absolute top-24 right-6 z-50 flex flex-col gap-2 w-80 pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            className="bg-indigo-600/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center justify-between pointer-events-auto"
                        >
                            <span className="text-sm font-medium">{n.msg}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Main Video Area */}
            <main className={`flex-1 relative flex items-center justify-center p-6 gap-6 transition-all duration-500 ${isChatOpen ? 'mr-[350px] md:mr-0' : ''}`}>
                {/* Grid adjustment based on streams */}
                <div className={`grid gap-6 w-full max-w-7xl h-full max-h-[85vh] transition-all ${remoteStream ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>

                    {/* Local User */}
                    <motion.div layout className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white font-semibold backdrop-blur-md bg-white/10 px-3 py-1 rounded-lg">You</span>
                            <div className="flex gap-2">
                                {!isMicOn && <div className="bg-red-500/80 p-2 rounded-full text-white"><MicOff size={14} /></div>}
                                {!isCameraOn && <div className="bg-red-500/80 p-2 rounded-full text-white"><VideoOff size={14} /></div>}
                            </div>
                        </div>
                    </motion.div>

                    {/* Remote User */}
                    <motion.div layout className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center group">
                        {remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover -scale-x-100" />
                        ) : (
                            <div className="text-center p-12">
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
                                    <Monitor size={40} className="text-indigo-400 relative z-10" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Waiting for connection...</h3>
                                <p className="text-slate-400">Invite someone using room code: <span className="text-indigo-400 font-mono font-bold bg-indigo-400/10 px-2 py-0.5 rounded">{roomId}</span></p>
                            </div>
                        )}
                        {remoteStream && (
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-semibold backdrop-blur-md bg-white/10 px-3 py-1 rounded-lg">Peer</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Bottom Controls Bar */}
            <motion.div
                initial={{ y: 100 }} animate={{ y: 0 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl"
            >
                <div className="flex items-center gap-2 px-2">
                    <ControlButton onClick={handleToggleMic} className={!isMicOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'hover:bg-white/10'}>
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </ControlButton>
                    <ControlButton onClick={handleToggleCamera} className={!isCameraOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'hover:bg-white/10'}>
                        {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </ControlButton>
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-2" />

                <div className="flex items-center gap-2 px-2">
                    <ControlButton onClick={() => setIsChatOpen(!isChatOpen)} className={isChatOpen ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'hover:bg-white/10'}>
                        <MessageSquare size={20} />
                        {messages.length > 0 && !isChatOpen && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />
                        )}
                    </ControlButton>
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-2" />

                <div className="px-2">
                    <button onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white h-12 px-6 rounded-xl flex items-center gap-2 font-semibold transition-all active:scale-95 shadow-lg shadow-red-500/20">
                        <PhoneOff size={20} />
                        <span className="hidden sm:inline">End Call</span>
                    </button>
                </div>
            </motion.div>

            {/* Chat Panel */}
            <motion.div
                initial={false}
                animate={{ x: isChatOpen ? 0 : '100%' }}
                className="absolute inset-y-0 right-0 w-full sm:w-[380px] bg-slate-950/80 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare size={18} className="text-indigo-400" />
                        In-Call Messages
                    </h3>
                    <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                            <MessageSquare size={40} className="opacity-20" />
                            <p className="text-sm">No messages yet. Say hello!</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`
                                    max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                    ${msg.isSelf
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                                    }
                                `}
                            >
                                {msg.message}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/50 border-t border-white/10">
                    <div className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:bg-transparent disabled:text-slate-500 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Helper Control Button Component
function ControlButton({ onClick, className = "", children }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 relative ${className}`}
        >
            {children}
        </button>
    );
}
