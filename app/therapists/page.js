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
        <div className="min-h-[calc(100vh-6rem)] max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 text-slate-200 font-sans">

            {/* Mobile Filter Toggle */}
            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white shadow-xl shadow-blue-600/30 py-3 px-5 rounded-full font-semibold flex items-center gap-2 backdrop-blur-md"
                onClick={() => setShowFilters(true)}
            >
                <SlidersHorizontal size={20} /> <span className="text-sm">Filters</span>
            </motion.button>

            {/* Mobile Filter Drawer (Overlay) */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                            onClick={() => setShowFilters(false)}
                        />
                        <motion.aside
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-white/10 z-50 p-6 shadow-2xl overflow-y-auto lg:hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-white">Filters</h2>
                                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                            <FilterContent filters={filters} handleFilterChange={handleFilterChange} setFilters={setFilters} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Sticky) */}
            <aside className="hidden lg:block w-80 shrink-0 self-start sticky top-8 space-y-8">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <Filter className="text-blue-400" size={20} />
                        <h2 className="text-xl font-bold text-white">Filters</h2>
                    </div>
                    <FilterContent filters={filters} handleFilterChange={handleFilterChange} setFilters={setFilters} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
                        Find your Specialist
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {therapists.length} {therapists.length === 1 ? 'professional' : 'professionals'} available for you
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[420px] rounded-3xl bg-slate-800/50 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode='popLayout'>
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
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30"
                                >
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Search size={28} className="text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No therapists found</h3>
                                    <p className="text-slate-400 mb-6">Try adjusting your filters or search criteria.</p>
                                    <button
                                        onClick={() => setFilters({ gender: '', category: '', minPrice: '', maxPrice: '' })}
                                        className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
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

// Extracted Filter Content for Reusability
function FilterContent({ filters, handleFilterChange, setFilters }) {
    return (
        <div className="space-y-8">
            {/* Gender Filter */}
            <div className="space-y-3">
                <h3 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Gender</h3>
                <div className="space-y-2">
                    {['M', 'F', 'Other'].map(gender => (
                        <label key={gender} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${filters.gender === gender ? 'bg-blue-600 border-blue-600' : 'border-slate-600 bg-slate-800/50 group-hover:border-slate-500'}`}>
                                {filters.gender === gender && <ChevronRight size={14} className="text-white rotate-90" />}
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
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-6 pr-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <span className="text-slate-600">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-6 pr-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <button
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-semibold transition-all hover:text-white hover:border-white/20 active:scale-[0.98] text-sm"
                onClick={() => setFilters({ gender: '', category: '', minPrice: '', maxPrice: '' })}
            >
                Reset All Filters
            </button>
        </div>
    );
}
