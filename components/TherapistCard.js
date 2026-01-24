import { Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TherapistCard({ therapist, onBook }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group glass rounded-3xl overflow-hidden flex flex-col relative"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                {therapist.expert && (
                    <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                        <CheckCircle size={14} /> Expert Choice
                    </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{therapist.name}</h3>
                    <p className="text-slate-300 text-sm opacity-90">{therapist.title}</p>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col text-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                        <Star size={16} fill="currentColor" />
                        <span className="font-bold text-sm">
                            {(therapist.stars.reduce((a, b) => a + b, 0) / therapist.stars.length || 5).toFixed(1)}
                        </span>
                    </div>
                    <span className="text-slate-400 text-xs font-medium">
                        {therapist.yoe} Yrs Experience
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {therapist.specialization.slice(0, 3).map((spec, i) => (
                        <span key={i} className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                            {spec}
                        </span>
                    ))}
                    {therapist.specialization.length > 3 && (
                        <span className="bg-slate-800/50 border border-slate-700/50 text-slate-400 px-3 py-1 rounded-full text-xs font-medium">
                            +{therapist.specialization.length - 3}
                        </span>
                    )}
                </div>

                <div className="mt-auto flex justify-between items-end pt-4 border-t border-slate-800/50">
                    <div className="flex flex-col">
                        {therapist.discounted_price ? (
                            <>
                                <span className="text-xs line-through text-slate-500 mb-0.5">₹{therapist.price}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">₹{therapist.discounted_price}</span>
                                    <span className="text-xs text-slate-400">/ session</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">₹{therapist.price}</span>
                                <span className="text-xs text-slate-400">/ session</span>
                            </div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all text-sm"
                        onClick={() => onBook(therapist._id)}
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
