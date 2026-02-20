import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    description?: string; // Optional subtitle (e.g. role)
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    searchable?: boolean;
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    label,
    icon,
    searchable = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Color generation based on name for avatar background
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500',
            'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
            'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
            'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
            'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="relative min-w-[240px]" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-4 mb-2 block">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between
                    bg-white hover:bg-slate-50 transition-all duration-200
                    border border-slate-200 rounded-2xl py-3 pl-4 pr-4
                    text-sm font-medium text-slate-700
                    shadow-sm hover:shadow-md
                    focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/50 focus:border-[#a78bfa]
                    group
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {icon && <span className="text-slate-400 group-hover:text-[#a78bfa] transition-colors">{icon}</span>}

                    {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                            {/* Avatar for selected item if it's not "Todos" */}
                            {selectedOption.value && (
                                <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedOption.label)} flex items-center justify-center text-[10px] text-white font-bold shrink-0`}>
                                    {getInitials(selectedOption.label)}
                                </div>
                            )}
                            <span className="truncate">{selectedOption.label}</span>
                        </div>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {searchable && (
                        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {filteredOptions.length > 0 ? (
                            <div className="p-1.5 space-y-0.5">
                                {filteredOptions.map((option) => {
                                    const isSelected = option.value === value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onChange(option.value);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors
                                                ${isSelected
                                                    ? 'bg-[#f5f3ff] text-[#7c3aed]'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {/* Initial Avatar for options */}
                                                {option.value ? (
                                                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(option.label)} flex items-center justify-center text-xs text-white font-bold shrink-0 shadow-sm`}>
                                                        {getInitials(option.label)}
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}

                                                <div className="flex flex-col truncate">
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-[#7c3aed]' : 'text-slate-700'}`}>
                                                        {option.label}
                                                    </span>
                                                    {option.description && (
                                                        <span className="text-[10px] text-slate-400 truncate">
                                                            {option.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-[#7c3aed] ml-2 shrink-0"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

