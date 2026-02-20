'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Area,
    Legend
} from 'recharts';

const data = [
    { date: '12', demos: 1.5, ventas: 0.5 },
    { date: '13', demos: 1.6, ventas: 1.2 },
    { date: '14', demos: 2.2, ventas: 2.8 },
    { date: '15', demos: 1.8, ventas: 1.5 },
    { date: '16', demos: 1.2, ventas: 0.8 },
    { date: '17', demos: 1.4, ventas: 1.0 },
];

export function SalesChart() {
    return (
        <div className="biofy-card p-6 h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold">Resumen de Actividad</h3>
                    <p className="text-xs text-muted-foreground">Comparativa Demos vs Ventas</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                        <span className="text-xs font-medium text-slate-500">Ventas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                        <span className="text-xs font-medium text-slate-500">Demos</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <ComposedChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    {/* Bar for Ventas */}
                    <Bar
                        name="Ventas"
                        dataKey="ventas"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                        barSize={12}
                    />
                    {/* Line for Demos */}
                    <Line
                        name="Demos"
                        type="monotone"
                        dataKey="demos"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
