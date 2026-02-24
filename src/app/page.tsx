'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { MetricCard } from '@/components/MetricCard';
import { DashboardFilters, FilterState } from '@/components/DashboardFilters';
import { SalesChart } from '@/components/SalesChart';
import { HistoricalTable } from '@/components/HistoricalTable';
import {
  Users,
  CheckCircle2,
  Presentation,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { useCRMData } from '@/hooks/useCRMData';

export default function DashboardPage() {
  const { data, loading } = useCRMData();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    comercial: '',
    tipo: '',
    cuenta: '',
    dateRange: undefined
  });

  let metrics = data?.metrics || {
    entregados: 0,
    confirmados: 0,
    demos: 0,
    ventas: 0
  };

  if (data && data.raw) {
    const isMatchComercial = (row: string) => {
      if (!appliedFilters.comercial) return true;

      const user = data.raw.usuarios?.find(u => u.nombre === appliedFilters.comercial);

      // Normalize row for matching (remove tabs/newlines and extra spaces)
      const normalizedRow = row.replace(/[\s\t\n\r]+/g, ' ').trim();

      if (user && user.login) {
        return normalizedRow.includes(user.login) || normalizedRow.includes(appliedFilters.comercial);
      }
      return normalizedRow.includes(appliedFilters.comercial);
    };

    const isMatchTipo = (row: string) => {
      if (!appliedFilters.tipo) return true;
      return row.includes(appliedFilters.tipo);
    };

    const isMatchCuenta = (row: string) => {
      if (!appliedFilters.cuenta) return true;
      const rowUpper = row.toUpperCase();
      const filterUpper = appliedFilters.cuenta.toUpperCase();

      const hasVipBiofy = rowUpper.includes('VIP BIOFY');
      const hasVip = rowUpper.includes('VIP');
      const hasAlquiler = rowUpper.includes('ALQUILER');
      const hasCliente = (rowUpper.includes('CLIENTE') && !rowUpper.includes('POTENCIAL')) ||
        rowUpper.includes('MANTENIMIENTO') ||
        rowUpper.includes('INCIDENCIA') ||
        rowUpper.includes('INSTALACION');

      // POTENCIAL matches if explicitly tagged or if it NO other category matches (Default)
      if (filterUpper === 'POTENCIAL') {
        const isExplicitPotencial = rowUpper.includes('POTENCIAL') || rowUpper.includes('CP');
        const isAnyOther = hasVipBiofy || hasVip || hasAlquiler || hasCliente;
        return isExplicitPotencial || !isAnyOther;
      }

      if (filterUpper === 'CLIENTE') return hasCliente;
      if (filterUpper === 'VIP BIOFY') return hasVipBiofy;
      if (filterUpper === 'VIP') return hasVip;
      if (filterUpper === 'ALQUILER') return hasAlquiler;

      return rowUpper.includes(filterUpper);
    };

    const isMatchDate = (row: string) => {
      if (!appliedFilters.dateRange || (!appliedFilters.dateRange.from && !appliedFilters.dateRange.to)) return true;

      // Dates usually appear in the 1st or 2nd field of the row separated by \t, e.g. "02/02/2026 8:30:00"
      const dateMatch = row.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!dateMatch) return true;

      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1; // 0-indexed
      const year = parseInt(dateMatch[3]);

      const rowDate = new Date(year, month, day);

      const fromDate = appliedFilters.dateRange.from;
      const toDate = appliedFilters.dateRange.to;

      if (fromDate && toDate) {
        // Set rowDate to midnight for fair comparison
        rowDate.setHours(0, 0, 0, 0);
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return rowDate >= start && rowDate <= end;
      } else if (fromDate) {
        rowDate.setHours(0, 0, 0, 0);
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        return rowDate >= start;
      } else if (toDate) {
        rowDate.setHours(0, 0, 0, 0);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return rowDate <= end;
      }
      return true;
    };

    const filterEvento = (row: string) => isMatchComercial(row) && isMatchTipo(row) && isMatchCuenta(row) && isMatchDate(row);
    const filterPedido = (row: string) => {
      // Pedidos don't use 'Tipo' (activity type) filter
      const rowClean = row.trim().toUpperCase();
      if (!rowClean || rowClean.startsWith('PEDIDO') || rowClean.includes('IMP.INGRE')) return false;
      // Exclude maintenance orders
      if (rowClean.includes('MANT.') || rowClean.includes('MANTENIMIENTO')) return false;
      return isMatchComercial(row) && isMatchCuenta(row) && isMatchDate(row);
    };

    const eventosFiltrados = data.raw.eventos.filter(filterEvento);
    const pedidosFiltrados = data.raw.pedidos.filter(filterPedido);

    metrics = {
      entregados: eventosFiltrados.length,
      confirmados: eventosFiltrados.filter((r: string) => r.includes('CONFIRMADO')).length,
      demos: eventosFiltrados.filter((r: string) => r.includes('COMPLETADO')).length,
      ventas: pedidosFiltrados.length
    };
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[90vh] overflow-hidden flex flex-col px-8 py-2">

        {/* Header Title */}
        <div className="flex items-center justify-between mb-2">
          <img src="/logo.png" alt="Culligan Biofy" className="h-40 md:h-48 object-contain" />

          <div className="flex items-center gap-4">


            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 outline-none focus:ring-2 focus:ring-[#a78bfa]/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a78bfa] to-[#60a5fa] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  AD
                </div>
                <span className="text-sm font-bold text-slate-700">Admin</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 origin-top-right">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">Administrador</p>
                    <p className="text-[10px] text-slate-400 font-medium">admin@biofy.es</p>
                  </div>
                  <div className="p-1.5">
                    <a href="/login" className="flex items-center justify-between px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold group">
                      <span>Cerrar Sesión</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-200 group-hover:bg-red-500 transition-colors"></div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Functional Filters (From Sketch) */}
        <DashboardFilters
          comerciales={data?.filters?.comerciales || []}
          tipos={data?.filters?.tipos || []}
          cuentas={data?.filters?.cuentas || []}
          onFilterUpdate={setAppliedFilters}
        />

        {data?.timestamp && (
          <div className="text-xs text-center text-slate-400 mb-2">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

          {/* Left Side: Stats & Main Chart */}
          <div className="lg:col-span-8 space-y-8">
            {/* Metric Cards (From Sketch) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <MetricCard
                label="Datos Entregados"
                value={metrics.entregados.toLocaleString()}
                change={0} // TODO: Calculate change
                icon={Users} // Using Users icon as placeholder for Send/Entregados
                color="bg-[#7dd3fc]"
                loading={loading}
              />
              <MetricCard
                label="Confirmados"
                value={metrics.confirmados.toLocaleString()}
                change={0}
                icon={CheckCircle2}
                color="bg-[#bef264]"
                loading={loading}
              />
            </div>

            <SalesChart />
          </div>

          {/* Right Side: Secondary Stats */}
          <div className="lg:col-span-4 space-y-8">
            {/* Demos and Ventas Vertical Cards */}
            <MetricCard
              label="Demos Realizadas"
              value={metrics.demos.toLocaleString()}
              change={0}
              icon={Presentation}
              color="bg-[#fde047]"
              className="lg:h-[180px]"
              loading={loading}
            />
            <MetricCard
              label="Ventas Cerradas"
              value={metrics.ventas.toLocaleString()}
              change={0}
              icon={TrendingUp}
              color="bg-[#f87171]"
              className="lg:h-[180px]"
              loading={loading}
            />

            {/* Mini Calendar/Info */}
            <div className="biofy-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700">Resumen Semanal</h3>
                <div className="p-1 px-2 bg-slate-50 rounded-lg text-xs font-bold border border-slate-100 flex items-center gap-1 text-slate-400">
                  Feb 2026
                </div>
              </div>
              <div className="flex items-center justify-between mt-8">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800">85%</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Conversión</span>
                </div>
                <div className="w-px h-10 bg-slate-100"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800">42</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Leads Hoy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Table */}
        <div className="mt-8">
          <HistoricalTable />
        </div>
      </div>
    </div>
  );
}
