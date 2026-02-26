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

export interface MetricConfig {
    key: string;
    name: string;
    color: string;
}

interface SalesChartProps {
    data?: any[];
    title?: string;
    subtitle?: string;
    lineKey?: string;
    barKey?: string;
    lineName?: string;
    barName?: string;
    lines?: MetricConfig[];
    bars?: MetricConfig[];
}

const defaultData = [
    { date: '12', demos: 1.5, ventas: 0.5 },
    { date: '13', demos: 1.6, ventas: 1.2 },
    { date: '14', demos: 2.2, ventas: 2.8 },
    { date: '15', demos: 1.8, ventas: 1.5 },
    { date: '16', demos: 1.2, ventas: 0.8 },
    { date: '17', demos: 1.4, ventas: 1.0 },
];

export function SalesChart({
    data = defaultData,
    title = "Resumen de Actividad",
    subtitle = "Comparativa Demos vs Ventas",
    lineKey = "demos",
    barKey = "ventas",
    lineName = "Demos",
    barName = "Ventas",
    lines,
    bars
}: SalesChartProps) {
    // If lines/bars aren't explicitly provided, use the legacy single line/bar props
    const activeLines = lines || [{ key: lineKey, name: lineName, color: "#3b82f6" }];
    const activeBars = bars || [{ key: barKey, name: barName, color: "#ef4444" }];

    return (
        <div className="biofy-card p-6 h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {activeBars.map(bar => (
                        <div key={bar.key} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bar.color }}></span>
                            <span className="text-xs font-medium text-slate-500">{bar.name}</span>
                        </div>
                    ))}
                    {activeLines.map(line => (
                        <div key={line.key} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }}></span>
                            <span className="text-xs font-medium text-slate-500">{line.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <ComposedChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                        {activeBars.map(bar => (
                            <linearGradient key={`grad-${bar.key}`} id={`barGradient-${bar.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={bar.color} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={bar.color} stopOpacity={0.3} />
                            </linearGradient>
                        ))}
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

                    {activeBars.map(bar => (
                        <Bar
                            key={bar.key}
                            name={bar.name}
                            dataKey={bar.key}
                            fill={`url(#barGradient-${bar.key})`}
                            radius={[6, 6, 0, 0]}
                            barSize={12}
                        />
                    ))}

                    {activeLines.map(line => (
                        <Line
                            key={line.key}
                            name={line.name}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color}
                            strokeWidth={3}
                            dot={{ fill: line.color, r: 4, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
