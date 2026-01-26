'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Clock, MapPin, Languages, CheckCircle, Video, BookOpen, Quote, Sparkles } from 'lucide-react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

export default function TherapistDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [therapist, setTherapist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTherapist = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/therapists/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTherapist(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTherapist();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading profile...</div>;
    }

    if (!therapist) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Therapist not found.</div>;
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group w-fit"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Specialists
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left Column) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Header Card */}
                        <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
                                    <img
                                        src={therapist.image}
                                        alt={therapist.name}
                                        className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-white/10"
                                    />
                                    {therapist.expert && (
                                        <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                            <Sparkles size={12} fill="currentColor" /> Expert
                                        </div>
                                    )}
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{therapist.name}</h1>
                                    <p className="text-xl text-blue-400 font-medium mb-4">{therapist.title}</p>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                                        {therapist.specialization.slice(0, 4).map((spec, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-slate-300">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-slate-400 border-t border-white/5 pt-6">
                                        <div className="flex items-center gap-2">
                                            <Star className="text-amber-400" size={18} fill="currentColor" />
                                            <span className="text-white font-bold">{(therapist.stars.reduce((a, b) => a + b, 0) / therapist.stars.length || 5).toFixed(1)}</span>
                                            <span className="hidden sm:inline">Rating</span>
                                        </div>
                                        <div className="w-px h-4 bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-blue-400" size={18} />
                                            <span className="text-white font-bold">{therapist.yoe} Yrs</span>
                                            <span className="hidden sm:inline">Experience</span>
                                        </div>
                                        <div className="w-px h-4 bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <Video className="text-purple-400" size={18} />
                                            <span className="text-white font-bold">Video</span>
                                            <span className="hidden sm:inline">Consultation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Content */}
                        <div className="space-y-6">
                            <Section title="About Me" icon={<Quote size={20} />}>
                                <p className="leading-relaxed text-slate-300 whitespace-pre-wrap">{therapist.about || "No verified bio available."}</p>
                            </Section>

                            <Section title="Therapy Approach" icon={<BookOpen size={20} />}>
                                <div className="bg-slate-900/30 p-6 rounded-2xl border border-white/5 mb-4">
                                    <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Methedology</h4>
                                    <p className="leading-relaxed text-slate-300">{therapist.therapy_approach}</p>
                                </div>
                                <div className="bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-purple-400 font-semibold mb-2 text-sm uppercase tracking-wider">Philosophy</h4>
                                    <p className="leading-relaxed text-slate-300">{therapist.thoughts_on_counselling}</p>
                                </div>
                            </Section>

                            <Section title="Qualifications" icon={<CheckCircle size={20} />}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {therapist.education.map((edu, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                            <span className="text-slate-300">{edu}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            <Section title="Check Availability" icon={<Clock size={20} />}>
                                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                                    <AvailabilityCalendar
                                        availability={{
                                            weekly: therapist.availability,
                                            overrides: therapist.availability_overrides
                                        }}
                                    // onSlotSelect={(slot) => ...} // Optional: Could pre-select for booking
                                    />
                                </div>
                            </Section>
                        </div>
                    </motion.div>

                    {/* Booking Sidebar (Right Column) */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-28 space-y-6"
                        >
                            <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-slate-400">Session Fee</span>
                                    <div className="text-right">
                                        {therapist.discounted_price ? (
                                            <>
                                                <span className="block text-xs line-through text-slate-500">₹{therapist.price}</span>
                                                <span className="text-3xl font-bold text-white">₹{therapist.discounted_price}</span>
                                            </>
                                        ) : (
                                            <span className="text-3xl font-bold text-white">₹{therapist.price}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <InfoRow icon={<Languages size={16} />} label="Languages" value={therapist.languages_known.join(', ')} />
                                    <InfoRow icon={<MapPin size={16} />} label="Location" value={therapist.isInHouse ? "In-House Specialist" : "Remote Partner"} />
                                </div>

                                <button
                                    onClick={() => router.push(`/book/${therapist._id}`)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Book a Session <Video size={18} />
                                </button>
                                <p className="text-center text-xs text-slate-500 mt-4">100% Secure & Confidential</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div className="glass p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex justify-between items-start text-sm">
            <div className="flex items-center gap-2 text-slate-400">
                {icon} <span>{label}</span>
            </div>
            <span className="text-slate-200 font-medium text-right max-w-[60%]">{value}</span>
        </div>
    );
}
