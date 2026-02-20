'use client';

import React from 'react';
import { MetricCard } from '@/components/MetricCard';
import { DashboardFilters } from '@/components/DashboardFilters';
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

  const metrics = data?.metrics || {
    entregados: 0,
    confirmados: 0,
    demos: 0,
    ventas: 0
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[90vh] overflow-hidden flex flex-col p-8">

        {/* Header Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">BIOFY</h1>
          <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a78bfa] to-[#60a5fa] flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <span className="text-sm font-bold text-slate-700">Admin</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <a href="/login" className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50 transition-colors text-slate-600 hover:text-red-500">
            <span className="text-xs font-bold">Salir</span>
          </a>
        </div>

        {/* Functional Filters (From Sketch) */}
        <DashboardFilters
          comerciales={data?.filters?.comerciales || []}
          tipos={data?.filters?.tipos || []}
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
