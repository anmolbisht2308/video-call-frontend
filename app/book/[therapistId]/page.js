'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Clock, Calendar as CalendarIcon, CheckCircle, Video, ArrowRight, ShieldCheck, Mail, Phone, User, Activity } from 'lucide-react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

const QUESTIONS = [
    {
        id: 'history',
        question: 'Have you ever taken therapy before?',
        options: ['Yes', 'No']
    },
    {
        id: 'issues',
        question: 'What do you want to discuss about?',
        options: ['Relationship', 'Career', 'Sexual Wellness', 'Academic', 'LGBTQIA+', 'Psychological Disorders', 'Others'],
        multi: true
    },
    {
        id: 'age',
        question: 'How old are you?',
        options: ['< 18', '18-25', '25-30', '30-40', '40-50', '> 50']
    },
    {
        id: 'for_whom',
        question: 'Is this therapy for you or someone else?',
        options: ['Individual (for myself)', 'Teen (for my child)', 'Couple (me and my partner)']
    }
];

export default function BookAppointment() {
    const { therapistId } = useParams();
    const router = useRouter();

    const [therapist, setTherapist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Questionnaire, 2: Slot/Phone, 3: Summary

    // Form State
    const [answers, setAnswers] = useState({ issues: [] });
    const [date, setDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null); // 'processing', 'success', 'error'
    const [meetCode, setMeetCode] = useState(null);

    useEffect(() => {
        const fetchTherapist = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/therapists/${therapistId}`);
                if (res.ok) {
                    setTherapist(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (therapistId) fetchTherapist();
    }, [therapistId]);

    // Handle Questionnaire Input
    const handleAnswer = (qid, val) => {
        setAnswers(prev => {
            if (qid === 'issues') {
                const current = prev.issues || [];
                return { ...prev, issues: current.includes(val) ? current.filter(i => i !== val) : [...current, val] };
            }
            return { ...prev, [qid]: val };
        });
    };

    const handleConfirmBooking = async () => {
        setBookingStatus('processing');
        try {
            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    therapistId,
                    date: date.toISOString(),
                    slot: selectedSlot,
                    phoneNumber,
                    amount: therapist.discounted_price || therapist.price,
                    answers
                }),
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Booking failed');
            const data = await res.json();
            setMeetCode(data.meetCode);
            setBookingStatus('success');
        } catch (error) {
            console.error(error);
            alert('Booking failed. Please try again.');
            setBookingStatus(null);
        }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
    if (!therapist) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Therapist not found</div>;

    return (
        <div className="min-h-[calc(100vh-6rem)] bg-background text-foreground p-4 md:p-8 font-sans selection:bg-primary/30">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {step > 1 ? 'Go Back' : 'Back to Profile'}
                </button>

                {/* Progress Steps */}
                {bookingStatus !== 'success' && (
                    <div className="flex items-center gap-4 mb-10 text-sm font-medium">
                        {[
                            { id: 1, label: 'Basic Information' },
                            { id: 2, label: 'Schedule & Contact' },
                            { id: 3, label: 'Preview & Pay' }
                        ].map((s, idx) => (
                            <div key={s.id} className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 ${step >= s.id ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= s.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-border text-muted-foreground'}`}>
                                        {s.id}
                                    </span>
                                    <span className="hidden md:inline">{s.label}</span>
                                </div>
                                {idx < 2 && <span className="text-muted-foreground">&gt;</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Success View */}
                {bookingStatus === 'success' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-3xl text-center flex flex-col items-center gap-6 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                            <CheckCircle size={48} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Booking Confirmed!</h2>
                        <p className="text-muted-foreground text-lg">
                            Session with <span className="text-foreground font-semibold">{therapist.name}</span> on <span className="text-foreground font-semibold">{date.toDateString()}</span> at <span className="text-foreground font-semibold">{selectedSlot}</span>.
                        </p>

                        <div className="bg-emerald-900/30 p-6 rounded-2xl border border-emerald-500/30 w-full mt-4">
                            <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Unique Meet Code</p>
                            <p className="text-3xl font-mono text-white tracking-widest">{meetCode}</p>
                            <p className="text-slate-400 text-xs mt-2">Use this code to join manually if needed.</p>
                        </div>

                        <div className="flex gap-4 w-full mt-4">
                            <button onClick={() => router.push(`/room/${meetCode}`)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <Video size={20} /> Join Meeting Now
                            </button>
                            <button onClick={() => router.push('/')} className="px-8 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground font-bold py-4 rounded-xl transition-all">
                                Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-secondary/30 border border-border/50 rounded-3xl p-6 md:p-10 backdrop-blur-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Step 1: Questionnaire */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {QUESTIONS.map(q => (
                                    <div key={q.id} className="space-y-3">
                                        <h3 className="text-lg font-medium text-foreground">{q.question}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {q.options.map(opt => {
                                                const isSelected = q.multi ? answers.issues?.includes(opt) : answers[q.id] === opt;
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleAnswer(q.id, opt)}
                                                        className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25' : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!answers.age || !answers.history || !answers.for_whom}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next Step <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Scheduling */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Clock className="text-blue-400" size={20} /> Select Date & Time</h3>
                                        <AvailabilityCalendar
                                            availability={{ weekly: therapist.availability, overrides: therapist.availability_overrides }}
                                            onDateSelect={setDate}
                                            selectedSlot={selectedSlot}
                                            onSlotSelect={setSelectedSlot}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Phone className="text-purple-400" size={20} /> Contact Details</h3>
                                        <div className="space-y-2">
                                            <label className="text-sm text-muted-foreground">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+1 234 567 890"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                                            <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                            <p className="text-sm text-muted-foreground">Your details are secure and will only be shared with your therapist before the session.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!selectedSlot || !phoneNumber}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next Step <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Summary */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-bold text-foreground mb-6">Booking Summary</h3>

                                <div className="bg-background rounded-2xl border border-border/50 p-6 grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <img src={therapist.image} className="w-16 h-16 rounded-xl object-cover" />
                                            <div>
                                                <h4 className="font-bold text-foreground text-lg">{therapist.name}</h4>
                                                <p className="text-primary">{therapist.title}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span> <span className="text-foreground">{date.toDateString()}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span> <span className="text-foreground">{selectedSlot}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span> <span className="text-foreground">60 Minutes</span></div>
                                        </div>
                                    </div>

                                    <div className="border-l border-border/50 pl-8 flex flex-col justify-center space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Consultation Fee</span>
                                            <span className="text-foreground">₹{therapist.price}</span>
                                        </div>
                                        {therapist.discounted_price && (
                                            <div className="flex justify-between items-center text-emerald-400">
                                                <span>Discount</span>
                                                <span>- ₹{therapist.price - therapist.discounted_price}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-border/50 my-2" />
                                        <div className="flex justify-between items-center text-xl font-bold">
                                            <span className="text-foreground">Total Pay</span>
                                            <span className="text-foreground">₹{therapist.discounted_price || therapist.price}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={bookingStatus === 'processing'}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {bookingStatus === 'processing' ? <Activity className="animate-spin" /> : 'Pay & Confirm Booking'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
