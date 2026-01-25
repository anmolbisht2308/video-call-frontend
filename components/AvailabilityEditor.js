'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Copy } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityEditor({ value, onChange }) {
    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'dates'
    const [schedule, setSchedule] = useState({});
    const [overrides, setOverrides] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        // initialize from value prop which should have { weekly: {}, overrides: {} } or mostly just weekly map if coming from old format
        // We need to handle migration or structure check
        // If value is simple map -> it's just weekly
        // If value has .weekly -> it's new structure

        // Actually, MongoDB might return a Map object or POJO.
        // Let's assume the parent passes the whole container object if we restructure ProfilePage logic.
        // OR we can keep `value` as just the weekly map, and add a separate prop `overrides`?
        // To reuse existing form logic cleanly, let's assume `value` might be the container OR we just combine them here and emit a combined object.

        // Wait, `onChange` expects to update `available_time_slots` (weekly) and now `availability_overrides` (new field).
        // It complicates the `value` prop if we try to shove both into one unless the parent passes an object `{ availability: ..., overrides: ... }`.

        // Let's rely on the parent sending `{ availability: {...}, overrides: {...} }` if we change Profile Page.
        // But currently Profile page passes `formData.availability`.
        // We should update Profile page first to pass a composite or separate props.

        // For now, let's assume `value` is `{ weekly: ..., overrides: ... }` and default gracefully.
        const weekly = value?.weekly || value || {};
        const ovr = value?.overrides || {};

        // Ensure days keys exist for weekly
        if (Object.keys(weekly).length === 0) {
            DAYS.forEach(day => weekly[day] = []);
        }

        setSchedule(weekly);
        setOverrides(ovr);
    }, [value]);

    const updateParent = (newWeekly, newOverrides) => {
        setSchedule(newWeekly);
        setOverrides(newOverrides);
        // Emit in a structure the parent expects. 
        // We will update Profile Page to expect `{ weekly, overrides }` from this component event.
        onChange({ weekly: newWeekly, overrides: newOverrides });
    };

    // --- Weekly Logic ---
    const handleToggleDay = (day) => {
        const newSchedule = { ...schedule };
        newSchedule[day] = newSchedule[day]?.length > 0 ? [] : ['09:00-17:00'];
        updateParent(newSchedule, overrides);
    };

    const updateWeeklySlot = (day, idx, val) => {
        const newSchedule = { ...schedule };
        newSchedule[day][idx] = val;
        updateParent(newSchedule, overrides);
    };

    const addWeeklySlot = (day) => {
        const newSchedule = { ...schedule };
        if (!newSchedule[day]) newSchedule[day] = [];
        newSchedule[day].push('09:00-17:00');
        updateParent(newSchedule, overrides);
    };

    const removeWeeklySlot = (day, idx) => {
        const newSchedule = { ...schedule };
        newSchedule[day].splice(idx, 1);
        updateParent(newSchedule, overrides);
    };

    const copyMondayToAll = () => {
        const mondaySlots = schedule['Monday'] || [];
        if (mondaySlots.length === 0) return;
        const newSchedule = { ...schedule };
        ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => newSchedule[day] = [...mondaySlots]);
        updateParent(newSchedule, overrides);
    };

    // --- Override Logic ---
    const handleDateSelect = (date) => {
        // Use local YYYY-MM-DD
        const offset = date.getTimezoneOffset();
        const iso = new Date(date.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
        setSelectedDate(iso);
    };

    const toggleOverride = () => {
        if (!selectedDate) return;
        const newOverrides = { ...overrides };
        if (newOverrides[selectedDate]) {
            delete newOverrides[selectedDate];
        } else {
            // Default to empty (unavailable)
            newOverrides[selectedDate] = [];
        }
        updateParent(schedule, newOverrides);
    };

    const addOverrideSlot = () => {
        if (!selectedDate) return;
        const newOverrides = { ...overrides };
        if (!newOverrides[selectedDate]) newOverrides[selectedDate] = [];
        newOverrides[selectedDate].push('09:00-17:00');
        updateParent(schedule, newOverrides);
    };

    const updateOverrideSlot = (idx, val) => {
        const newOverrides = { ...overrides };
        newOverrides[selectedDate][idx] = val;
        updateParent(schedule, newOverrides);
    };

    const removeOverrideSlot = (idx) => {
        const newOverrides = { ...overrides };
        newOverrides[selectedDate].splice(idx, 1);
        updateParent(schedule, newOverrides);
    };

    return (
        <div className="space-y-6">
            <div className="flex p-1 bg-slate-900 rounded-xl w-fit border border-white/5 mx-auto md:mx-0">
                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'weekly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Weekly Recurring
                </button>
                <button
                    onClick={() => setActiveTab('dates')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'dates' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Specific Dates
                </button>
            </div>

            {activeTab === 'weekly' ? (
                /* Weekly View */
                <div className="space-y-6 animate-in fade-in duration-300">
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
                                <DayRow
                                    key={day}
                                    day={day}
                                    isActive={isActive}
                                    slots={schedule[day] || []}
                                    onToggle={() => handleToggleDay(day)}
                                    onAdd={() => addWeeklySlot(day)}
                                    onUpdate={(idx, val) => updateWeeklySlot(day, idx, val)}
                                    onRemove={(idx) => removeWeeklySlot(day, idx)}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Specific Dates View */
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 h-fit">
                        <Calendar
                            onChange={handleDateSelect}
                            value={selectedDate ? new Date(selectedDate) : new Date()}
                            className="w-full bg-transparent border-none text-slate-200 font-sans"
                            tileContent={({ date, view }) => {
                                if (view === 'month') {
                                    const offset = date.getTimezoneOffset();
                                    const iso = new Date(date.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
                                    if (overrides[iso]) return <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>;
                                }
                            }}
                            tileClassName={({ date, view }) => {
                                if (view === 'month' && selectedDate) {
                                    const offset = date.getTimezoneOffset();
                                    const iso = new Date(date.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
                                    if (iso === selectedDate) return '!bg-blue-600 !text-white rounded-lg';
                                }
                                return 'hover:bg-slate-800 rounded-lg transition-colors text-slate-300';
                            }}
                        />
                        <style jsx global>{`
                            .react-calendar { 
                                background: transparent !important; 
                                border: none !important; 
                                width: 100% !important;
                                font-family: inherit !important;
                                line-height: 1.125em !important;
                            }
                            .react-calendar__navigation {
                                display: flex;
                                margin-bottom: 1em;
                            }
                            .react-calendar__navigation button {
                                color: white !important;
                                min-width: 44px;
                                background: none;
                                font-size: 1.1rem;
                                font-weight: bold;
                                margin-top: 8px;
                            }
                            .react-calendar__navigation button:disabled {
                                background-color: transparent !important;
                                opacity: 0.5;
                            }
                            .react-calendar__navigation button:enabled:hover,
                            .react-calendar__navigation button:enabled:focus {
                                background-color: rgba(255,255,255,0.1) !important;
                                border-radius: 8px;
                            }
                            .react-calendar__month-view__weekdays {
                                text-align: center;
                                text-transform: uppercase;
                                font-weight: bold;
                                font-size: 0.75em;
                                color: #94a3b8; /* slate-400 */
                                margin-bottom: 0.5em;
                            }
                            .react-calendar__month-view__weekdays__weekday {
                                padding: 0.5em;
                                text-decoration: none !important;
                            }
                            .react-calendar__tile {
                                max-width: 100%;
                                padding: 10px 6.6667px;
                                background: none;
                                text-align: center;
                                line-height: 16px;
                                font-size: 0.9rem;
                                color: #e2e8f0; /* slate-200 */
                            }
                            .react-calendar__tile:disabled {
                                background-color: transparent !important;
                                color: #334155 !important;
                                cursor: not-allowed;
                            }
                            .react-calendar__tile:enabled:hover,
                            .react-calendar__tile:enabled:focus {
                                background-color: rgba(30, 41, 59, 0.5) !important; /* slate-800 */
                                border-radius: 8px;
                                color: white;
                            }
                            .react-calendar__tile--now {
                                background: rgba(59, 130, 246, 0.1) !important;
                                border: 1px solid rgba(59, 130, 246, 0.4) !important;
                                border-radius: 8px !important;
                                color: #60a5fa !important;
                            }
                            .react-calendar__tile--now:enabled:hover,
                            .react-calendar__tile--now:enabled:focus {
                                background: rgba(59, 130, 246, 0.2) !important;
                            }
                            .react-calendar__tile--active {
                                background: #2563eb !important;
                                color: white !important;
                                border-radius: 8px !important;
                            }
                            .react-calendar__tile--active:enabled:hover,
                            .react-calendar__tile--active:enabled:focus {
                                background: #1d4ed8 !important;
                            }
                            
                            /* Custom dot for overrides */
                            .react-calendar__tile--hasActive .dot {
                                display: block;
                            }
                        `}</style>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 relative">
                        {!selectedDate ? (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">Select a date to manage rules</div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <h3 className="font-bold text-white text-lg">{new Date(selectedDate).toDateString()}</h3>
                                    {overrides[selectedDate] ? (
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30 font-medium">Overridden</span>
                                    ) : (
                                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Default Weekly Rules</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!overrides[selectedDate]}
                                            onChange={toggleOverride}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                                    </label>
                                    <span className="text-sm font-medium text-slate-200">Override Weekly Schedule</span>
                                </div>

                                {overrides[selectedDate] && (
                                    <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                                        {overrides[selectedDate].length === 0 && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                                <p className="text-sm text-red-300 font-medium">Unavailable (Day Off)</p>
                                                <p className="text-xs text-red-400/70 mt-1">No slots active for this date.</p>
                                            </div>
                                        )}

                                        {overrides[selectedDate].map((slot, idx) => (
                                            <SlotInput
                                                key={idx}
                                                value={slot}
                                                onChange={(val) => updateOverrideSlot(idx, val)}
                                                onDelete={() => removeOverrideSlot(idx)}
                                            />
                                        ))}

                                        <button onClick={addOverrideSlot} className="w-full py-2 border border-dashed border-slate-700 rounded-xl text-sm flex items-center justify-center gap-2 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                            <Plus size={16} /> Add Custom Slot
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponents
function DayRow({ day, isActive, slots, onToggle, onAdd, onUpdate, onRemove }) {
    return (
        <div className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-900/20 border-white/5 opacity-70 hover:opacity-100'}`}>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <div className="min-w-[120px] flex items-center gap-3">
                    <label className="relative cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={onToggle} className="peer sr-only" />
                        <div className="w-10 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                </div>
                <div className="flex-1 space-y-3">
                    {isActive ? (
                        <>
                            {slots.map((slot, idx) => <SlotInput key={idx} value={slot} onChange={(val) => onUpdate(idx, val)} onDelete={() => onRemove(idx)} />)}
                            <button onClick={onAdd} className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors mt-2">
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
}

function SlotInput({ value, onChange, onDelete }) {
    const [start, end] = value.split('-');
    return (
        <div className="flex items-center gap-2 group">
            <input type="time" value={start} onChange={(e) => onChange(`${e.target.value}-${end}`)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:border-blue-500 outline-none" />
            <span className="text-slate-500">-</span>
            <input type="time" value={end} onChange={(e) => onChange(`${start}-${e.target.value}`)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:border-blue-500 outline-none" />
            <button type="button" onClick={onDelete} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    );
}
