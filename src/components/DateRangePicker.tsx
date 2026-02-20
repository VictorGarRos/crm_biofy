import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    placeholder?: string;
    label?: string;
}

export function DateRangePicker({
    date,
    setDate,
    placeholder = 'Seleccionar rango',
    label
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range);
        // If both dates are selected, close after a short delay
        if (range?.from && range?.to) {
            setTimeout(() => setIsOpen(false), 200);
        }
    };

    const formatDateRange = (range: DateRange | undefined) => {
        if (!range?.from) return '';
        if (range.to) {
            return `${format(range.from, 'd MMM', { locale: es })} - ${format(range.to, 'd MMM', { locale: es })}`;
        }
        return format(range.from, 'd MMM', { locale: es });
    };

    return (
        <div className="relative min-w-[240px]" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-4 mb-2 block">
                    {label}
                </label>
            )}

            <div className="relative group">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full flex items-center justify-between
                        bg-white hover:bg-slate-50 transition-all duration-200
                        border border-slate-200 rounded-2xl py-3 pl-4 pr-10
                        text-sm font-medium text-slate-700
                        shadow-sm hover:shadow-md
                        focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/50 focus:border-[#a78bfa]
                        group
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <CalendarIcon className="text-slate-400 group-hover:text-[#a78bfa] transition-colors w-4 h-4" />

                        {date?.from ? (
                            <span className="truncate block font-semibold text-slate-600">
                                {formatDateRange(date)}
                            </span>
                        ) : (
                            <span className="text-slate-400">{placeholder}</span>
                        )}
                    </div>
                </button>

                {date?.from && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setDate(undefined);
                        }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}

                <ChevronDown
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute z-50 mt-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-xl animate-in fade-in zoom-in-95 duration-200 origin-top left-0 sm:right-auto">
                    <DayPicker
                        mode="range"
                        selected={date}
                        onSelect={handleSelect}
                        locale={es}
                        defaultMonth={date?.from || new Date()}
                        modifiersClassNames={{
                            selected: 'bg-[#a78bfa] text-white',
                            today: 'font-bold text-[#a78bfa]',
                            range_middle: 'bg-[#f5f3ff] text-[#7c3aed] rounded-none',
                            range_start: 'bg-[#a78bfa] text-white rounded-l-md rounded-r-none',
                            range_end: 'bg-[#a78bfa] text-white rounded-r-md rounded-l-none'
                        }}
                        styles={{
                            caption: { color: '#a78bfa', fontWeight: 'bold' },
                            head_cell: { color: '#94a3b8', fontSize: '0.75rem' },
                            day: { borderRadius: '0.5rem' }
                        }}
                    />
                </div>
            )}
        </div>
    );
}
