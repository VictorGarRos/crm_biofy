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
    userLabel?: string;
    typeLabel?: string;
    hideTipoFilter?: boolean;
}

export function DashboardFilters({ comerciales, tipos, cuentas, onFilterUpdate, userLabel = 'Comercial', typeLabel = 'Tipo de Evento', hideTipoFilter = false }: DashboardFiltersProps) {
    const [selectedComercial, setSelectedComercial] = useState('');
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedCuenta, setSelectedCuenta] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const comercialOptions = [
        { value: '', label: 'Todos', description: `Mostrar todo el equipo` },
        ...comerciales.map(c => ({
            value: c,
            label: c,
            description: userLabel
        }))
    ];

    const tipoOptions = [
        { value: '', label: `Todos los ${typeLabel.toLowerCase()}s`, description: 'Cualquier interacción' },
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
        <div className="flex flex-col md:flex-row flex-wrap items-end gap-4 mb-8 bg-white p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm relative z-20">
            <div className="flex-1 w-full md:min-w-[280px]">
                <CustomSelect
                    label="Usuario"
                    placeholder={`Seleccionar ${userLabel.toLowerCase()}...`}
                    options={comercialOptions}
                    value={selectedComercial}
                    onChange={setSelectedComercial}
                    icon={<User className="w-4 h-4" />}
                    searchable={true}
                />
            </div>

            {!hideTipoFilter && (
                <div className="flex-1 w-full md:min-w-[200px]">
                    <CustomSelect
                        label={typeLabel}
                        placeholder={`Filtrar por ${typeLabel.toLowerCase()}...`}
                        options={tipoOptions}
                        value={selectedTipo}
                        onChange={setSelectedTipo}
                        icon={<Filter className="w-4 h-4" />}
                        searchable={true}
                    />
                </div>
            )}

            <div className="flex-1 w-full md:min-w-[200px]">
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

            <div className="flex-1 w-full md:min-w-[240px]">
                <DateRangePicker
                    label="Rango Fechas"
                    date={dateRange}
                    setDate={setDateRange}
                />
            </div>

            <div className="w-full md:w-auto">
                <button
                    onClick={handleUpdate}
                    className="w-full md:w-auto bg-[#0f172a] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                    Actualizar
                </button>
            </div>
        </div>
    );
}
