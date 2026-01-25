'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

export default function AvailabilityCalendar({ availability, onDateSelect, onSlotSelect, selectedSlot }) {
    const [date, setDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);

    // Compute slots when date changes
    useEffect(() => {
        if (!date) return;

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const weeklySlots = availability?.[dayName] || [];

        const computedSlots = [];
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        weeklySlots.forEach(slot => {
            const [startStr, endStr] = slot.split('-');
            if (!startStr || !endStr) return;

            const [startHour, startMin] = startStr.split(':').map(Number);
            const [endHour, endMin] = endStr.split(':').map(Number);

            // Create 1-hour chunks
            let currentHour = startHour;
            let currentMin = startMin;

            while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                const nextHour = currentHour + 1;

                // Format times (e.g., "09:00", "10:00")
                const formatTime = (h, m) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                // Stop if next hour exceeds end time (handle partial hours if needed, but assuming full hours for now)
                if (nextHour > endHour) break;

                const slotLabel = `${formatTime(currentHour, currentMin)}-${formatTime(nextHour, currentMin)}`;

                // Check past time
                const slotTime = new Date(date);
                slotTime.setHours(currentHour, currentMin, 0);

                if (!isToday || slotTime > now) {
                    computedSlots.push(slotLabel);
                }

                currentHour = nextHour;
            }
        });

        setAvailableSlots(computedSlots);
        if (onDateSelect) onDateSelect(date);
        // Reset slot selection on date change
        if (onSlotSelect) onSlotSelect(null);
    }, [date, availability]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 calendar-container">
                <Calendar
                    onChange={setDate}
                    value={date}
                    minDate={new Date()}
                    className="w-full bg-transparent border-none text-slate-200 font-sans"
                    tileClassName={({ date: d, view }) => {
                        // Highlight if selected
                        if (view === 'month' && d.toDateString() === date.toDateString()) {
                            return 'bg-blue-600 text-white rounded-lg !bg-blue-600';
                        }
                        // Disable if past
                        if (d < new Date().setHours(0, 0, 0, 0)) return 'opacity-25 text-slate-600 cursor-not-allowed';
                        return 'hover:bg-slate-800 rounded-lg transition-colors text-slate-300';
                    }}
                />
            </div>

            <div className="w-full md:w-64 flex flex-col gap-4 border-l border-white/5 md:pl-8">
                <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">Available Slots</h3>
                <p className="text-xs text-slate-500 mb-2">{date.toDateString()}</p>

                <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {availableSlots.length > 0 ? (
                        availableSlots.map((slot, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSlotSelect && onSlotSelect(slot)}
                                className={`text-sm py-2 px-3 rounded-lg border transition-all ${selectedSlot === slot
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                                    }`}
                            >
                                {slot}
                            </button>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            <Clock size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No slots available</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .react-calendar { 
                    background: transparent !important; 
                    border: none !important; 
                    width: 100% !important;
                    font-family: inherit !important;
                }
                .react-calendar__navigation button {
                    color: white !important;
                    min-width: 44px;
                    background: none;
                    font-size: 1.1rem;
                    font-weight: bold;
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
                .react-calendar__month-view__weekdays__weekday {
                    color: #64748b;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    font-weight: 700;
                    text-decoration: none !important;
                }
                .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: bold;
                    font-size: 0.75em;
                }
                .react-calendar__tile {
                    padding: 10px 6px !important;
                    background: none;
                    text-align: center;
                    line-height: 16px;
                    font-size: 0.9rem;
                }
                .react-calendar__tile:disabled {
                    background-color: transparent !important;
                    color: #334155 !important;
                }
                .react-calendar__tile--now {
                    background: rgba(59, 130, 246, 0.2) !important;
                    border: 1px solid rgba(59, 130, 246, 0.5) !important;
                    border-radius: 8px !important;
                    color: #60a5fa !important;
                }
                .react-calendar__tile--now:enabled:hover,
                .react-calendar__tile--now:enabled:focus {
                    background: rgba(59, 130, 246, 0.3) !important;
                }
                .react-calendar__tile--active {
                    background: #2563eb !important;
                    color: white !important;
                    border-radius: 8px !important;
                    border: none !important;
                }
                .react-calendar__tile--active:enabled:hover,
                .react-calendar__tile--active:enabled:focus {
                    background: #1d4ed8 !important;
                }
            `}</style>
        </div>
    );
}
