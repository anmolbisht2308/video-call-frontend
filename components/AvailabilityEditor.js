'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Copy, Clock, Check, Trash2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityEditor({ value, onChange }) {
    const [schedule, setSchedule] = useState(value || {});
    // Structure: { "Monday": ["09:00-17:00"], "Tuesday": [] ... }

    useEffect(() => {
        // Initialize if empty
        if (!value || Object.keys(value).length === 0) {
            const initial = {};
            DAYS.forEach(day => initial[day] = []);
            setSchedule(initial);
        } else {
            setSchedule(value);
        }
    }, [value]);

    const handleToggleDay = (day) => {
        const newSchedule = { ...schedule };
        if (newSchedule[day]?.length > 0) {
            // If has slots, clear them (disable)
            newSchedule[day] = [];
        } else {
            // Enable with default slot
            newSchedule[day] = ['09:00-17:00'];
        }
        updateParent(newSchedule);
    };

    const addSlot = (day) => {
        const newSchedule = { ...schedule };
        if (!newSchedule[day]) newSchedule[day] = [];
        newSchedule[day].push('09:00-17:00');
        updateParent(newSchedule);
    };

    const removeSlot = (day, index) => {
        const newSchedule = { ...schedule };
        newSchedule[day].splice(index, 1);
        updateParent(newSchedule);
    };

    const updateSlot = (day, index, field, val) => {
        const newSchedule = { ...schedule };
        const [start, end] = newSchedule[day][index].split('-');

        if (field === 'start') newSchedule[day][index] = `${val}-${end}`;
        else newSchedule[day][index] = `${start}-${val}`;

        updateParent(newSchedule);
    };

    const copyMondayToAll = () => {
        const mondaySlots = schedule['Monday'];
        if (!mondaySlots || mondaySlots.length === 0) return;

        const newSchedule = { ...schedule };
        ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
            newSchedule[day] = [...mondaySlots];
        });
        updateParent(newSchedule);
    };

    const updateParent = (newSchedule) => {
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-400">Set your recurring weekly availability.</p>
                <button
                    type="button"
                    onClick={copyMondayToAll}
                    disabled={!schedule['Monday']?.length}
                    className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Copy size={14} /> Copy Mon to Weekdays
                </button>
            </div>

            <div className="grid gap-3">
                {DAYS.map(day => {
                    const isActive = schedule[day]?.length > 0;

                    return (
                        <div key={day} className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-900/20 border-white/5 opacity-70 hover:opacity-100'}`}>
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                                {/* Day Toggle */}
                                <div className="min-w-[120px] flex items-center gap-3">
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={() => handleToggleDay(day)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-10 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                    <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                                </div>

                                {/* Slots */}
                                <div className="flex-1 space-y-3">
                                    {isActive ? (
                                        <>
                                            {schedule[day].map((slot, idx) => {
                                                const [start, end] = slot.split('-');
                                                return (
                                                    <div key={idx} className="flex items-center gap-2 group">
                                                        <input
                                                            type="time"
                                                            value={start}
                                                            onChange={(e) => updateSlot(day, idx, 'start', e.target.value)}
                                                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                                        />
                                                        <span className="text-slate-500">-</span>
                                                        <input
                                                            type="time"
                                                            value={end}
                                                            onChange={(e) => updateSlot(day, idx, 'end', e.target.value)}
                                                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSlot(day, idx)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <button
                                                type="button"
                                                onClick={() => addSlot(day)}
                                                className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors mt-2"
                                            >
                                                <Plus size={14} /> Add Break / Slot
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-sm text-slate-600 italic py-1">Unavailable</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
