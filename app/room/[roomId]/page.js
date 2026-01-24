'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Send, X, Monitor, Copy, Check } from 'lucide-react';
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
    const [copied, setCopied] = useState(false);
    const [showControls, setShowControls] = useState(true);

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

    useEffect(() => {
        let timeout;
        const handleActivity = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            clearTimeout(timeout);
        };
    }, []);

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

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden font-sans text-slate-100 selection:bg-indigo-500/30">

            {/* Header */}
            <AnimatePresence>
                {showControls && (
                    <motion.header
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="absolute top-0 left-0 right-0 z-40 p-2 sm:p-3 md:p-4 lg:p-6"
                    >
                        <div className="max-w-7xl mx-auto flex justify-between items-start gap-2">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 md:px-6 md:py-3 shadow-2xl flex items-center gap-2 sm:gap-3 flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm"
                            >
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-[8px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Room</h2>
                                    <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-mono text-white tracking-wide truncate">{roomId}</p>
                                </div>
                                <button
                                    onClick={copyRoomCode}
                                    className="p-1 sm:p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                                >
                                    {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-slate-400" />}
                                </button>
                                <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full flex-shrink-0 ${connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.4)]' : 'bg-amber-500 animate-pulse'}`} />
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 md:px-6 md:py-3 shadow-2xl flex items-center gap-1.5 sm:gap-2"
                            >
                                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300">{userCount}</span>
                            </motion.div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Notifications */}
            <div className="absolute top-14 sm:top-16 md:top-20 lg:top-24 right-2 sm:right-3 md:right-4 lg:right-6 z-50 flex flex-col gap-1.5 sm:gap-2 w-56 sm:w-64 md:w-72 lg:w-80 pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            className="bg-indigo-600/90 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-lg sm:rounded-xl shadow-lg backdrop-blur-md pointer-events-auto"
                        >
                            <span className="text-[10px] sm:text-xs md:text-sm font-medium">{n.msg}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Main Video Area */}
            <main className={`flex-1 relative flex items-center justify-center p-2 sm:p-3 md:p-4 transition-all duration-300 ${isChatOpen ? 'lg:mr-96' : ''}`}>
                <div className="w-full h-full flex flex-col gap-2 sm:gap-3">

                    {remoteStream && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-black rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group flex-1 w-full"
                        >
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain bg-black -scale-x-100"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-semibold backdrop-blur-md bg-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm">Peer</span>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        layout
                        className={`relative bg-black rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group ${remoteStream
                                ? 'absolute bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28 right-2 sm:right-3 md:right-4 w-20 h-28 xs:w-24 xs:h-32 sm:w-28 sm:h-36 md:w-36 md:h-48 lg:w-40 lg:h-52 xl:w-48 xl:h-60 z-30'
                                : 'flex-1 w-full'
                            }`}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover bg-black -scale-x-100"
                        />
                        <div className={`absolute inset-x-0 bottom-0 p-1 sm:p-1.5 md:p-2 lg:p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-end ${remoteStream ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                            <span className="text-white font-semibold backdrop-blur-md bg-white/10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded text-[8px] sm:text-[10px] md:text-xs">You</span>
                            <div className="flex gap-0.5 sm:gap-1">
                                {!isMicOn && <div className="bg-red-500/90 p-0.5 sm:p-1 rounded-full text-white"><MicOff className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /></div>}
                                {!isCameraOn && <div className="bg-red-500/90 p-0.5 sm:p-1 rounded-full text-white"><VideoOff className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /></div>}
                            </div>
                        </div>
                    </motion.div>

                    {!remoteStream && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center z-20 p-3 sm:p-4 md:p-6"
                        >
                            <div className="text-center p-4 sm:p-5 md:p-6 lg:p-8 bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl max-w-xs sm:max-w-sm md:max-w-md mx-auto w-full">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
                                    <Monitor className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-indigo-400 relative z-10" />
                                </div>
                                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white mb-1.5 sm:mb-2">Waiting for connection...</h3>
                                <p className="text-slate-400 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm">Share this code</p>
                                <div
                                    onClick={copyRoomCode}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 text-indigo-400 font-mono font-bold bg-indigo-400/10 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-lg cursor-pointer hover:bg-indigo-400/20 transition-colors text-xs sm:text-sm md:text-base active:scale-95"
                                >
                                    <span className="select-all">{roomId}</span>
                                    {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Bottom Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="absolute bottom-0 left-0 right-0 z-40 p-2 sm:p-3 md:p-4 lg:p-6"
                    >
                        <div className="max-w-3xl mx-auto bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl p-1.5 sm:p-2 md:p-3 lg:p-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 shadow-2xl">

                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                                <ControlButton
                                    onClick={handleToggleMic}
                                    className={!isMicOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/30' : 'hover:bg-white/10'}
                                >
                                    {isMicOn ? <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" /> : <MicOff className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />}
                                </ControlButton>
                                <ControlButton
                                    onClick={handleToggleCamera}
                                    className={!isCameraOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/30' : 'hover:bg-white/10'}
                                >
                                    {isCameraOn ? <Video className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" /> : <VideoOff className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />}
                                </ControlButton>
                            </div>

                            <div className="w-px h-6 sm:h-7 md:h-8 lg:h-10 bg-white/10 hidden xs:block" />

                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                                <ControlButton
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    className={isChatOpen ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-indigo-500' : 'hover:bg-white/10'}
                                >
                                    <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                                    {messages.length > 0 && !isChatOpen && (
                                        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-red-500 rounded-full border-2 border-slate-900 text-[8px] sm:text-[9px] md:text-[10px] flex items-center justify-center font-bold">{messages.length}</span>
                                    )}
                                </ControlButton>
                            </div>

                            <div className="w-px h-6 sm:h-7 md:h-8 lg:h-10 bg-white/10 hidden xs:block" />

                            <button
                                onClick={handleLeave}
                                className="bg-red-500 hover:bg-red-600 text-white h-8 sm:h-9 md:h-10 lg:h-12 px-3 sm:px-4 md:px-5 lg:px-6 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center gap-1.5 sm:gap-2 font-semibold transition-all active:scale-95 shadow-lg shadow-red-500/30 text-[10px] sm:text-xs md:text-sm lg:text-base"
                            >
                                <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                                <span className="hidden xs:inline">End</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="p-3 sm:p-4 md:p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2">
                                <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-indigo-400" />
                                Messages
                            </h3>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors text-slate-400 hover:text-white active:scale-95"
                            >
                                <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 flex flex-col gap-2.5 sm:gap-3 md:gap-4">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 sm:gap-3">
                                    <MessageSquare className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 opacity-20" />
                                    <p className="text-[10px] sm:text-xs md:text-sm">No messages yet. Say hello!</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`max-w-[85%] p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs md:text-sm leading-relaxed shadow-sm break-words ${msg.isSelf ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'}`}>
                                        {msg.message}
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 sm:mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-2.5 sm:p-3 md:p-4 bg-slate-900/50 border-t border-white/10">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl pl-3 pr-10 sm:pl-4 sm:pr-11 md:pr-12 py-2.5 sm:py-3 md:py-3.5 text-[11px] sm:text-xs md:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md sm:rounded-lg disabled:opacity-40 disabled:bg-slate-700 disabled:text-slate-500 transition-all active:scale-95"
                                >
                                    <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}

function ControlButton({ onClick, className = "", children }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center text-white transition-all relative border border-white/10 ${className}`}
        >
            {children}
        </motion.button>
    );
}