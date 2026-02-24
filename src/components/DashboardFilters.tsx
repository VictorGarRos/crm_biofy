import React, { useState } from 'react';
import { Search, ChevronDown, User, Filter } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';

export interface FilterState {
    comercial: string;
    tipo: string;
    cuenta: string;
    dateRange: DateRange | undefined;
}

interface DashboardFiltersProps {
    comerciales: string[];
    tipos: string[];
    cuentas: string[];
    onFilterUpdate: (filters: FilterState) => void;
}

export function DashboardFilters({ comerciales, tipos, cuentas, onFilterUpdate }: DashboardFiltersProps) {
    const [selectedComercial, setSelectedComercial] = useState('');
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedCuenta, setSelectedCuenta] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const comercialOptions = [
        { value: '', label: 'Todos', description: 'Mostrar todo el equipo' },
        ...comerciales.map(c => ({
            value: c,
            label: c,
            description: 'Comercial'
        }))
    ];

    const tipoOptions = [
        { value: '', label: 'Todos los tipos', description: 'Cualquier interacción' },
        ...tipos.map(t => ({
            value: t,
            label: t,
            description: 'Categoría'
        }))
    ];

    const cuentaOptions = [
        { value: '', label: 'Todas las cuentas', description: 'Cualquier cliente' },
        ...cuentas.map(c => ({
            value: c,
            label: c,
            description: 'Tipo Cuenta'
        }))
    ];

    const handleUpdate = () => {
        onFilterUpdate({
            comercial: selectedComercial,
            tipo: selectedTipo,
            cuenta: selectedCuenta,
            dateRange
        });
    };

    return (
        <div className="flex flex-wrap items-end gap-4 mb-8 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative z-20">
            <div className="flex-1 min-w-[280px]">
                <CustomSelect
                    label="Usuario"
                    placeholder="Seleccionar comercial..."
                    options={comercialOptions}
                    value={selectedComercial}
                    onChange={setSelectedComercial}
                    icon={<User className="w-4 h-4" />}
                    searchable={true}
                />
            </div>

            <div className="flex-1 min-w-[200px]">
                <CustomSelect
                    label="Tipo de Evento"
                    placeholder="Filtrar por tipo..."
                    options={tipoOptions}
                    value={selectedTipo}
                    onChange={setSelectedTipo}
                    icon={<Filter className="w-4 h-4" />}
                    searchable={true}
                />
            </div>

            <div className="flex-1 min-w-[200px]">
                <CustomSelect
                    label="Tipo de Cliente"
                    placeholder="Filtrar por cuenta..."
                    options={cuentaOptions}
                    value={selectedCuenta}
                    onChange={setSelectedCuenta}
                    icon={<Search className="w-4 h-4" />}
                    searchable={true}
                />
            </div>

            <div className="flex-1 min-w-[240px]">
                <DateRangePicker
                    label="Rango Fechas"
                    date={dateRange}
                    setDate={setDateRange}
                />
            </div>

            <div className="">
                <button
                    onClick={handleUpdate}
                    className="bg-[#0f172a] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                    Actualizar
                </button>
            </div>
        </div>
    );
}
