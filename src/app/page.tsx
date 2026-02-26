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
  PhoneOff,
  AlertCircle,
  Clock,
  CalendarCheck,
  Package,
  XCircle,
  Wrench,
  Settings,
  ClipboardList
} from 'lucide-react';
import { useCRMData } from '@/hooks/useCRMData';

export default function DashboardPage() {
  const { data, loading } = useCRMData();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<'COMERCIAL' | 'TELEOPERADORA' | 'TECNICO'>('COMERCIAL');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    comercial: '',
    tipo: '',
    cuenta: '',
    dateRange: undefined
  });

  // Extended metrics for Teleoperadoras
  let metrics: any = data?.metrics || {
    entregados: 0,
    confirmados: 0,
    demos: 0,
    ventas: 0,
    nulos: 0,
    errores: 0,
    noLocalizados: 0,
    pendientes: 0,
    ventasAprobadas: 0
  };

  if (data && data.raw) {
    const isMatchComercial = (row: string) => {
      const normalizedRow = row.replace(/[\s\t\n\r]+/g, ' ').trim().toUpperCase();

      if (!appliedFilters.comercial) {
        // Ensure we only count events for the allowed users of the current mode
        const allowedUsers = dashboardMode === 'COMERCIAL' ? data.filters?.comerciales : (dashboardMode === 'TELEOPERADORA' ? data.filters?.teleoperadoras : data.filters?.tecnicos);
        if (!allowedUsers || allowedUsers.length === 0) return true;

        // Find if this row belongs to any of the allowed users
        for (const userName of allowedUsers) {
          const upperName = userName.toUpperCase();
          const uObj = data.raw.usuarios?.find((u: any) => u.nombre === userName);
          if (uObj && uObj.login && new RegExp(`\\b${uObj.login.toUpperCase()}\\b`).test(normalizedRow)) return true;
          if (normalizedRow.includes(upperName)) return true;
        }
        return false;
      }

      // In either mode, we are searching for a name in the row
      const upperFilter = appliedFilters.comercial.toUpperCase();
      const user = data.raw.usuarios?.find((u: any) => u.nombre === appliedFilters.comercial);

      if (user && user.login) {
        return new RegExp(`\\b${user.login.toUpperCase()}\\b`).test(normalizedRow) || normalizedRow.includes(upperFilter);
      }
      return normalizedRow.includes(upperFilter);
    };

    const isMatchTipo = (row: string) => {
      if (!appliedFilters.tipo) return true;

      if (dashboardMode === 'TELEOPERADORA') {
        const rowUpper = row.toUpperCase();
        if (appliedFilters.tipo === 'Lead Digital') {
          return rowUpper.includes('LEAD DIGITAL') || rowUpper.includes('CP') || rowUpper.includes('POTENCIAL');
        } else if (appliedFilters.tipo === 'Llamada') {
          // If it's not a lead, we consider it a call for teleoperadoras
          return !rowUpper.includes('LEAD DIGITAL') && !rowUpper.includes('CP') && !rowUpper.includes('POTENCIAL');
        }
      }

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

    const filterTarea = (row: string) => {
      if (typeof row !== 'string') return false;
      const rowClean = row.trim().toUpperCase();
      // Only parse actual task rows starting with a number and a dot, e.g. "1. "
      if (!rowClean || !/^\s*\d+\.\s*/.test(row)) return false;

      // Since data.raw.tareas already comes pre-filtered by 'Equipo: TELEOPERADORAS' from the CRM,
      // we only need to enforce user matching if a specific user is selected.
      const matchComercial = appliedFilters.comercial ? isMatchComercial(row) : true;

      // Tareas do not strictly follow 'Cuenta' like events, we apply Comercial, Tipo and Date
      return matchComercial && isMatchTipo(row) && isMatchDate(row);
    };

    const eventosFiltrados = data.raw.eventos.filter(filterEvento);
    const pedidosFiltrados = data.raw.pedidos.filter(filterPedido);
    const tareasFiltradas = (data.raw.tareas || []).filter(filterTarea);

    metrics = {
      entregados: dashboardMode === 'TELEOPERADORA' ? tareasFiltradas.length : eventosFiltrados.length,
      confirmados: dashboardMode === 'TELEOPERADORA'
        ? tareasFiltradas.filter((r: string) => r.toUpperCase().includes('CONFIRMADO') || r.toUpperCase().includes('CONCERTADO')).length
        : eventosFiltrados.filter((r: string) => r.toUpperCase().includes('CONFIRMADO') || r.toUpperCase().includes('CONCERTADO')).length,
      demos: eventosFiltrados.filter((r: string) => r.toUpperCase().includes('COMPLETADO')).length, // 'Demos' stays on events usually
      ventas: pedidosFiltrados.length,
      nulos: dashboardMode === 'TELEOPERADORA'
        ? tareasFiltradas.filter((r: string) => r.toUpperCase().includes('NULO')).length
        : eventosFiltrados.filter((r: string) => r.toUpperCase().includes('NULO')).length,
      errores: dashboardMode === 'TELEOPERADORA'
        ? tareasFiltradas.filter((r: string) => r.toUpperCase().includes('ERROR')).length
        : eventosFiltrados.filter((r: string) => r.toUpperCase().includes('ERROR')).length,
      noLocalizados: dashboardMode === 'TELEOPERADORA'
        ? tareasFiltradas.filter((r: string) => r.toUpperCase().includes('NO LOCALIZADO') || r.toUpperCase().includes('NO LOCALIZADA') || r.toUpperCase().includes('NO LOCALIZA')).length
        : eventosFiltrados.filter((r: string) => r.toUpperCase().includes('NO LOCALIZADO') || r.toUpperCase().includes('NO LOCALIZADA')).length,
      pendientes: dashboardMode === 'TELEOPERADORA'
        ? tareasFiltradas.filter((r: string) => r.toUpperCase().includes('PENDIENTE')).length
        : eventosFiltrados.filter((r: string) => r.toUpperCase().includes('PENDIENTE')).length,
      ventasAprobadas: pedidosFiltrados.filter((r: string) => r.toUpperCase().includes('APROBADA')).length
    };

    if (dashboardMode === 'TECNICO' && data.filters?.tipos) {
      metrics.tipos = {};
      data.filters.tipos.forEach(t => {
        metrics.tipos[t] = eventosFiltrados.filter(r => r.includes(t)).length;
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[90vh] overflow-hidden flex flex-col p-4 md:px-8 md:py-4">

        {/* Header Title */}
        <div className="flex flex-col xl:flex-row items-center justify-between mb-6 gap-4 xl:gap-0">
          <div className="flex items-center justify-between w-full xl:w-auto">
            <img src="/logo.png" alt="Culligan Biofy" className="h-24 sm:h-32 md:h-40 object-contain" />
            <div className="xl:hidden">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5 md:px-4 md:py-2 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 outline-none focus:ring-2 focus:ring-[#a78bfa]/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a78bfa] to-[#60a5fa] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    AD
                  </div>
                  <span className="text-sm font-bold text-slate-700 hidden sm:block">Admin</span>
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

          {/* Tabs for Dashboard Selector */}
          <div className="flex flex-wrap justify-center gap-1 md:gap-2 p-1 bg-slate-100/50 rounded-2xl w-full xl:w-fit overflow-x-auto hide-scrollbar">
            <button
              onClick={() => {
                setDashboardMode('COMERCIAL');
                setAppliedFilters({ comercial: '', tipo: '', cuenta: '', dateRange: undefined });
              }}
              className={`px-4 sm:px-6 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${dashboardMode === 'COMERCIAL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/80'
                }`}
            >
              Comerciales
            </button>
            <button
              onClick={() => {
                setDashboardMode('TECNICO');
                setAppliedFilters({ comercial: '', tipo: '', cuenta: '', dateRange: undefined });
              }}
              className={`px-4 sm:px-6 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${dashboardMode === 'TECNICO'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/80'
                }`}
            >
              Técnicos
            </button>
            <button
              onClick={() => {
                setDashboardMode('TELEOPERADORA');
                setAppliedFilters({ comercial: '', tipo: '', cuenta: '', dateRange: undefined });
              }}
              className={`px-4 sm:px-6 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${dashboardMode === 'TELEOPERADORA'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/80'
                }`}
            >
              Teleoperadoras
            </button>
          </div>

          <div className="items-center gap-4 hidden xl:flex">


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

        {/* Functional Filters */}
        <DashboardFilters
          key={dashboardMode}
          comerciales={dashboardMode === 'COMERCIAL' ? (data?.filters?.comerciales || []) : (dashboardMode === 'TELEOPERADORA' ? (data?.filters?.teleoperadoras || []) : (data?.filters?.tecnicos || []))}
          tipos={dashboardMode === 'TELEOPERADORA' ? (data?.filters?.tareas || []) : (data?.filters?.tipos || [])}
          cuentas={data?.filters?.cuentas || []}
          onFilterUpdate={setAppliedFilters}
          userLabel={dashboardMode === 'COMERCIAL' ? 'Comercial' : (dashboardMode === 'TELEOPERADORA' ? 'Teleoperadora' : 'Técnico')}
          typeLabel={dashboardMode === 'TELEOPERADORA' ? 'Tipo de Tarea' : 'Tipo de Evento'}
          hideTipoFilter={dashboardMode === 'TECNICO'}
        />

        {data?.timestamp && (
          <div className="text-xs text-center text-slate-400 mb-2">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

          {/* Left Side: Stats & Main Chart */}
          <div className="lg:col-span-8 space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardMode === 'COMERCIAL' && (
                <>
                  <MetricCard
                    label="Datos Entregados"
                    value={metrics.entregados.toLocaleString()}
                    icon={Users}
                    color="bg-[#7dd3fc]"
                    loading={loading}
                  />
                  <MetricCard
                    label="Confirmados"
                    value={metrics.confirmados.toLocaleString()}
                    icon={CheckCircle2}
                    color="bg-[#bef264]"
                    loading={loading}
                  />
                  <MetricCard
                    label="Nulos"
                    value={metrics.nulos?.toLocaleString() || '0'}
                    icon={XCircle}
                    color="bg-red-100"
                    loading={loading}
                  />
                </>
              )}

              {dashboardMode === 'TECNICO' && (
                <>
                  <MetricCard
                    label="Total Asignados"
                    value={metrics.entregados.toLocaleString()}
                    icon={Users}
                    color="bg-[#7dd3fc]"
                    loading={loading}
                  />
                  {data?.filters?.tipos?.map(tipo => {
                    let IconComponent = ClipboardList;
                    let colorClass = "bg-slate-100";
                    const tUpper = tipo.toUpperCase();

                    if (tUpper.includes('INSTALACI')) {
                      IconComponent = Wrench;
                      colorClass = "bg-blue-100";
                    } else if (tUpper.includes('MANTENIMIENTO')) {
                      IconComponent = Settings;
                      colorClass = "bg-emerald-100";
                    } else if (tUpper.includes('INCIDENCIA')) {
                      IconComponent = AlertCircle;
                      colorClass = "bg-red-100";
                    }

                    return (
                      <MetricCard
                        key={tipo}
                        label={tipo}
                        value={(metrics.tipos?.[tipo] || 0).toLocaleString()}
                        icon={IconComponent}
                        color={colorClass}
                        loading={loading}
                        hideFooter
                      />
                    );
                  })}
                </>
              )}

              {dashboardMode === 'TELEOPERADORA' && (
                <>
                  <MetricCard
                    label="Cedidos"
                    value={metrics.entregados.toLocaleString()}
                    icon={Users}
                    color="bg-slate-100"
                    loading={loading}
                    hideFooter
                  />
                  <MetricCard
                    label="Concertados"
                    value={metrics.confirmados.toLocaleString()}
                    icon={CalendarCheck}
                    color="bg-blue-100"
                    loading={loading}
                    hideFooter
                  />
                  <MetricCard
                    label="Nulos"
                    value={metrics.nulos?.toLocaleString() || '0'}
                    icon={XCircle}
                    color="bg-red-100"
                    loading={loading}
                    hideFooter
                  />
                  <MetricCard
                    label="Errores"
                    value={metrics.errores?.toLocaleString() || '0'}
                    icon={AlertCircle}
                    color="bg-orange-100"
                    loading={loading}
                    hideFooter
                  />
                  <MetricCard
                    label="No Localizado/a"
                    value={metrics.noLocalizados?.toLocaleString() || '0'}
                    icon={PhoneOff}
                    color="bg-gray-100"
                    loading={loading}
                    hideFooter
                  />
                  <MetricCard
                    label="Pendientes"
                    value={metrics.pendientes?.toLocaleString() || '0'}
                    icon={Clock}
                    color="bg-amber-100"
                    loading={loading}
                    hideFooter
                  />
                </>
              )}
            </div>

            {(() => {
              const getTipoCount = (keyword: string) => {
                if (!metrics.tipos) return 0;
                const key = Object.keys(metrics.tipos).find(k => k.toLowerCase().includes(keyword.toLowerCase()));
                return key ? metrics.tipos[key] : 0;
              };
              const countInst = getTipoCount('instalaci');
              const countMant = getTipoCount('mantenimiento');
              const countInc = getTipoCount('incidencia');

              return (
                <SalesChart
                  title={dashboardMode === 'COMERCIAL' ? "Resumen de Actividad" : (dashboardMode === 'TELEOPERADORA' ? "Resumen de Teleoperadoras" : "Resumen de Técnicos")}
                  subtitle={dashboardMode === 'TELEOPERADORA' ? "Comparativa Concertados vs Cedidos" : (dashboardMode === 'TECNICO' ? "Instalaciones vs Mantenimientos e Incidencias" : "Comparativa Demos vs Ventas")}
                  barName={dashboardMode === 'TELEOPERADORA' ? "Cedidos" : "Ventas"}
                  lineName={dashboardMode === 'TELEOPERADORA' ? "Concertados" : "Demos"}
                  barKey={dashboardMode === 'TELEOPERADORA' ? "cedidos" : "ventas"}
                  lineKey={dashboardMode === 'TELEOPERADORA' ? "concertados" : "demos"}
                  bars={dashboardMode === 'TECNICO' ? [
                    { key: 'instalacion', name: 'Instalación', color: '#3b82f6' }
                  ] : undefined}
                  lines={dashboardMode === 'TECNICO' ? [
                    { key: 'mantenimiento', name: 'Mantenimiento', color: '#10b981' },
                    { key: 'incidencia', name: 'Incidencias', color: '#ef4444' }
                  ] : undefined}
                  data={dashboardMode === 'TELEOPERADORA' ? [
                    { date: '12', concertados: Math.floor(metrics.confirmados * 0.4), cedidos: Math.floor(metrics.entregados * 0.6) },
                    { date: '13', concertados: Math.floor(metrics.confirmados * 0.5), cedidos: Math.floor(metrics.entregados * 0.7) },
                    { date: '14', concertados: Math.floor(metrics.confirmados * 0.6), cedidos: Math.floor(metrics.entregados * 0.8) },
                    { date: '15', concertados: Math.floor(metrics.confirmados * 0.45), cedidos: Math.floor(metrics.entregados * 0.65) },
                    { date: '16', concertados: Math.floor(metrics.confirmados * 0.3), cedidos: Math.floor(metrics.entregados * 0.5) },
                    { date: '17', concertados: metrics.confirmados, cedidos: metrics.entregados },
                  ] : (dashboardMode === 'TECNICO' ? [
                    { date: '12', instalacion: Math.floor(countInst * 0.2), mantenimiento: Math.floor(countMant * 0.1), incidencia: Math.floor(countInc * 0.3) },
                    { date: '13', instalacion: Math.floor(countInst * 0.3), mantenimiento: Math.floor(countMant * 0.2), incidencia: Math.floor(countInc * 0.1) },
                    { date: '14', instalacion: Math.floor(countInst * 0.1), mantenimiento: Math.floor(countMant * 0.4), incidencia: Math.floor(countInc * 0.2) },
                    { date: '15', instalacion: Math.floor(countInst * 0.4), mantenimiento: Math.floor(countMant * 0.1), incidencia: Math.floor(countInc * 0.1) },
                    { date: '16', instalacion: Math.floor(countInst * 0.2), mantenimiento: Math.floor(countMant * 0.3), incidencia: Math.floor(countInc * 0.4) },
                    { date: '17', instalacion: countInst, mantenimiento: countMant, incidencia: countInc },
                  ] : undefined)}
                />
              );
            })()}
          </div>

          {/* Right Side: Secondary Stats */}
          <div className="lg:col-span-4 space-y-8">
            {/* Demos and Ventas Vertical Cards */}
            {dashboardMode !== 'TELEOPERADORA' ? (
              <>
                {dashboardMode === 'COMERCIAL' && (
                  <MetricCard
                    label="Demos Realizadas"
                    value={metrics.demos.toLocaleString()}
                    icon={Presentation}
                    color="bg-[#fde047]"
                    className="lg:h-[180px]"
                    loading={loading}
                  />
                )}
                <MetricCard
                  label="Ventas Cerradas"
                  value={metrics.ventas.toLocaleString()}
                  icon={TrendingUp}
                  color="bg-[#f87171]"
                  className="lg:h-[180px]"
                  loading={loading}
                />
              </>
            ) : (
              <>
                <MetricCard
                  label="Pedidos"
                  value={metrics.ventas.toLocaleString()}
                  icon={Package}
                  color="bg-purple-100"
                  className="lg:h-[180px]"
                  loading={loading}
                  hideFooter
                />
                <MetricCard
                  label="Ventas (Aprobadas)"
                  value={metrics.ventasAprobadas?.toLocaleString() || '0'}
                  icon={TrendingUp}
                  color="bg-emerald-100"
                  className="lg:h-[180px]"
                  loading={loading}
                  hideFooter
                />
              </>
            )}

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
