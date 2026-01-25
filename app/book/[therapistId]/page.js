'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Clock, Calendar as CalendarIcon, CheckCircle, AlertCircle, Video } from 'lucide-react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

export default function BookAppointment() {
    const { therapistId } = useParams();
    const router = useRouter();

    const [therapist, setTherapist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingStatus, setBookingStatus] = useState(null); // 'processing', 'success', 'error'

    useEffect(() => {
        const fetchTherapist = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/therapists/${therapistId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTherapist(data);
                } else {
                    console.error('Therapist not found');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (therapistId) fetchTherapist();
    }, [therapistId]);

    // Date state kept for confirmation message
    useEffect(() => {
        // Reset slot if date changes
        setSelectedSlot(null);
    }, [date]);

    const handleConfirmBooking = async () => {
        if (!selectedSlot) return;
        setBookingStatus('processing');

        // Simulate API call
        setTimeout(() => {
            setBookingStatus('success');
            // In a real app, you'd create a Booking record here
        }, 1500);
    };

    const startSession = async () => {
        // Create a room and join
        try {
            // For demo, we just create a random room based on booking
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
            // Fallback for demo if auth fails or backend issue
            router.push(`/room/booking-${therapistId}-${Date.now()}`);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading details...</div>;
    }

    if (!therapist) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
                <p>Therapist not found.</p>
                <button onClick={() => router.back()} className="text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Specialists
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Therapist Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 h-fit"
                    >
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 border-2 border-slate-700/50 shadow-lg">
                                <img src={therapist.image} alt={therapist.name} className="w-full h-full object-cover" />
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-2">{therapist.name}</h1>
                            <p className="text-blue-400 font-medium mb-4">{therapist.title}</p>

                            <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
                                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> {therapist.stars && (therapist.stars.reduce((a, b) => a + b, 0) / therapist.stars.length || 5).toFixed(1)}
                                </span>
                                <span>•</span>
                                <span>{therapist.yoe} Yrs Exp</span>
                                <span>•</span>
                                <span>{therapist.category}</span>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Session Price</span>
                                    <div className="text-right">
                                        {therapist.discounted_price ? (
                                            <>
                                                <span className="block text-xs line-through text-slate-600">₹{therapist.price}</span>
                                                <span className="text-lg font-bold text-white">₹{therapist.discounted_price}</span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-bold text-white">₹{therapist.price}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Booking Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {bookingStatus === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl text-center flex flex-col items-center gap-6"
                            >
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2">
                                    <CheckCircle size={40} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-emerald-400 mb-2">Booking Confirmed!</h2>
                                    <p className="text-slate-300 max-w-md">
                                        Your session with {therapist.name} is scheduled for <span className="text-white font-semibold">{date.toDateString()}</span> at <span className="text-white font-semibold">{selectedSlot}</span>.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={startSession} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center gap-2">
                                        <Video size={18} /> Join Meeting Room Now
                                    </button>
                                    <button onClick={() => router.push('/')} className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold py-3 px-8 rounded-xl transition-all">
                                        Go to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                                            <CalendarIcon size={24} />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Select a Date & Time</h2>
                                    </div>

                                    <AvailabilityCalendar
                                        availability={{
                                            weekly: therapist.availability,
                                            overrides: therapist.availability_overrides
                                        }}
                                        onDateSelect={setDate}
                                        selectedSlot={selectedSlot}
                                        onSlotSelect={setSelectedSlot}
                                    />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex justify-end"
                                >
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={!selectedSlot || bookingStatus === 'processing'}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {bookingStatus === 'processing' ? (
                                            <span className="animate-pulse">Confirming...</span>
                                        ) : (
                                            <>
                                                Book Appointment {selectedSlot && <span className="bg-blue-700 px-2 py-0.5 rounded text-xs">{selectedSlot}</span>}
                                                <CheckCircle size={18} />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
