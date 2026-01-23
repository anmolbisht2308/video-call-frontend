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
    const iceCandidatesQueue = useRef([]);

    const addNotification = (msg) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    // 1. Capture Media Effect
    useEffect(() => {
        let componentMounted = true;

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (componentMounted) {
                    localStreamRef.current = stream;
                    setLocalStream(stream);
                } else {
                    stream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                console.error('Error accessing media devices:', err);
            }
        };

        if (roomId) {
            initMedia();
        }

        return () => {
            componentMounted = false;
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            setLocalStream(null);
        };
    }, [roomId]);

    // 2. Socket & WebRTC Effect (Dependent on localStream)
    useEffect(() => {
        // WAITS for localStream before connecting
        if (!roomId || !localStream) return;

        socketRef.current = io('http://localhost:5000'); // TODO: Env var

        socketRef.current.on('connect', () => {
            console.log('Connected to signaling server');
            setConnectionStatus('connected');
            socketRef.current.emit('join-room', roomId, 'user');
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
            if (peerConnectionRef.current) peerConnectionRef.current.close();
        };
    }, [localStream, roomId]);

    // Create Peer Connection
    const createPeerConnection = useCallback((targetSocketId) => {
        if (peerConnectionRef.current) peerConnectionRef.current.close();

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

        // IMPORTANT: Add tracks immediately
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peerConnectionRef.current = pc;
        return pc;
    }, []);

    const handleUserConnected = async (targetSocketId) => {
        console.log('User connected, creating offer for:', targetSocketId);
        const pc = createPeerConnection(targetSocketId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('offer', {
            target: targetSocketId,
            sdp: offer,
            sender: socketRef.current.id
        });
    };

    const handleReceiveOffer = async ({ sdp, sender }) => {
        console.log('Received offer from', sender);
        const pc = createPeerConnection(sender);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit('answer', {
            target: sender,
            sdp: answer
        });

        processBufferedCandidates(pc);
    };

    const handleReceiveAnswer = async ({ sdp }) => {
        console.log('Received answer');
        const pc = peerConnectionRef.current;
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            processBufferedCandidates(pc);
        }
    };

    const handleReceiveIceCandidate = async ({ candidate }) => {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        } else {
            iceCandidatesQueue.current.push(candidate);
        }
    };

    const processBufferedCandidates = async (pc) => {
        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding buffered ice candidate', e);
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
        if (socketRef.current) socketRef.current.emit('send-message', payload);

        setMessages(prev => [...prev, {
            message: text,
            senderId: 'self',
            timestamp: new Date().toISOString(),
            isSelf: true
        }]);
    };

    const toggleMic = () => {
        // Should use ref since state might be stale in closures if not careful, but state is okay here
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled
            });
        }
    }

    const toggleCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled
            });
        }
    }

    const startLocalStream = () => { };

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