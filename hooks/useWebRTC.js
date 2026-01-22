import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ],
};

export const useWebRTC = (roomId) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [userCount, setUserCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);

    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    const addNotification = (msg) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    // Initialize Socket and WebRTC
    useEffect(() => {
        if (!roomId) return;

        // Connect to signaling server
        socketRef.current = io('http://localhost:4000'); // TODO: Env var

        socketRef.current.on('connect', () => {
            console.log('Connected to signaling server');
            setConnectionStatus('connected');
            socketRef.current.emit('join-room', roomId, 'user'); // send dummy user
        });

        socketRef.current.on('room-users', (count) => {
            setUserCount(count);
        });

        socketRef.current.on('user-connected', (userId) => {
            addNotification('A user joined the room');
            handleUserConnected(userId);
        });

        socketRef.current.on('user-disconnected', (userId) => {
            addNotification('User disconnected');
            handleUserDisconnected();
        });

        socketRef.current.on('receive-message', (payload) => {
            setMessages(prev => [...prev, payload]);
        });

        socketRef.current.on('offer', handleReceiveOffer);
        socketRef.current.on('answer', handleReceiveAnswer);
        socketRef.current.on('ice-candidate', handleReceiveIceCandidate);

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) peerConnectionRef.current.close();
        };
    }, [roomId]);

    // capture user media
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    };

    // Create Peer Connection
    const createPeerConnection = useCallback((targetSocketId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    target: targetSocketId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Track received from', targetSocketId);
            setRemoteStream(event.streams[0]);
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peerConnectionRef.current = pc;
        return pc;
    }, []);

    // Signaling Handlers
    const handleUserConnected = async (targetSocketId) => {
        console.log('User connected, creating offer for:', targetSocketId);
        const pc = createPeerConnection(targetSocketId);

        // Create Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('offer', {
            target: targetSocketId, // Send to the NEW user
            sdp: offer,
            sender: socketRef.current.id // I am the sender
        });
    };

    const handleReceiveOffer = async ({ sdp, sender }) => {
        console.log('Received offer from', sender);
        const pc = createPeerConnection(sender); // create PC pointing to sender
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit('answer', {
            target: sender, // Reply to sender
            sdp: answer
        });
    };

    const handleReceiveAnswer = async ({ sdp }) => {
        console.log('Received answer');
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        }
    };

    const handleReceiveIceCandidate = async ({ candidate }) => {
        if (peerConnectionRef.current) {
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    };

    const handleUserDisconnected = () => {
        setRemoteStream(null);
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    };

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const payload = {
            roomId,
            message: text
        };
        socketRef.current.emit('send-message', payload);

        // Optimistic update
        setMessages(prev => [...prev, {
            message: text,
            senderId: 'self',
            timestamp: new Date().toISOString(),
            isSelf: true
        }]);
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        }
    }

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        }
    }

    return {
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
    };
};