'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, X, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import TherapistCard from '../../components/TherapistCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function TherapistsPage() {
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        gender: '',
        category: '',
        minPrice: '',
        maxPrice: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTherapists();
    }, [filters]);

    const fetchTherapists = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`http://localhost:5000/api/therapists?${query}`);
            const data = await res.json();
            setTherapists(data);
        } catch (error) {
            console.error('Error fetching therapists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value === prev[key] ? '' : value }));
    };

    const handleBook = (id) => {
        router.push(`/book/${id}`);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen relative max-w-[1600px] mx-auto p-4 md:p-8 gap-8">

            {/* Mobile Filter Toggle */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white border-0 py-3.5 px-6 rounded-full shadow-xl shadow-blue-600/30 z-50 font-semibold flex items-center gap-2 cursor-pointer backdrop-blur-md"
                onClick={() => setShowFilters(!showFilters)}
            >
                <SlidersHorizontal size={20} /> Filters
            </motion.button>

            {/* Sidebar Filters */}
            <AnimatePresence>
                <motion.aside
                    initial={false}
                    animate={{
                        x: showFilters ? 0 : '-100%',
                        opacity: showFilters ? 1 : 0
                    }}
                    // Using media query logic in variants is tricky, so relying on CSS classes for desktop visibility
                    className={`
                        fixed md:sticky top-0 md:top-8 left-0 h-[100dvh] md:h-fit w-80 
                        bg-slate-900/95 md:bg-white/5 backdrop-blur-2xl md:backdrop-blur-xl 
                        border-r md:border border-white/10 md:rounded-3xl p-6 md:p-8 
                        flex flex-col gap-8 z-40 md:opacity-100 md:translate-x-0
                        ${showFilters ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'} 
                        transition-all duration-300 md:transition-none
                     `}
                >
                    <div className="flex justify-between items-center md:mb-2">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Filters</h2>
                        <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setShowFilters(false)}>
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Gender Filter */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Gender</h3>
                            <div className="space-y-2">
                                {['M', 'F', 'Other'].map(gender => (
                                    <label key={gender} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${filters.gender === gender ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800/50 group-hover:border-slate-500'}`}>
                                            {filters.gender === gender && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><ChevronRight size={14} className="text-white rotate-90" /></motion.div>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={filters.gender === gender}
                                            onChange={() => handleFilterChange('gender', gender)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm font-medium transition-colors ${filters.gender === gender ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                            {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Others'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Price Range</h3>
                            <div className="flex items-center gap-3 bg-slate-950/30 p-2 rounded-xl border border-white/5">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none p-2 text-center"
                                />
                                <span className="text-slate-600 font-medium">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none p-2 text-center"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className="mt-auto w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-semibold transition-all hover:text-white hover:border-white/20 active:scale-[0.98]"
                        onClick={() => setFilters({ gender: '', category: '', minPrice: '', maxPrice: '' })}
                    >
                        Reset All
                    </button>
                </motion.aside>
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 p-2"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-white">
                        Find your Specialist
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {therapists.length} {therapists.length === 1 ? 'professional' : 'professionals'} available for you
                    </p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[500px] rounded-3xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8">
                        <AnimatePresence>
                            {therapists.length > 0 ? (
                                therapists.map(therapist => (
                                    <TherapistCard
                                        key={therapist._id}
                                        therapist={therapist}
                                        onBook={handleBook}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full flex flex-col items-center justify-center p-24 text-slate-500 gap-6 glass rounded-3xl border-dashed border-2 border-slate-700/50"
                                >
                                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                                        <Search size={32} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No therapists found</h3>
                                        <p>Try adjusting your search filters</p>
                                    </div>
                                    <button
                                        onClick={() => setFilters({ gender: '', category: '', minPrice: '', maxPrice: '' })}
                                        className="text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
