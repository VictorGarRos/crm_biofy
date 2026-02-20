import React from 'react';

const data = [
    { date: '12 feb', entregados: 12, confirmados: 8, demos: 4, ventas: 2 },
    { date: '13 feb', entregados: 15, confirmados: 10, demos: 5, ventas: 3 },
    { date: '14 feb', entregados: 20, confirmados: 14, demos: 8, ventas: 5 },
    { date: '15 feb', entregados: 10, confirmados: 6, demos: 3, ventas: 1 },
    { date: '16 feb', entregados: 18, confirmados: 12, demos: 6, ventas: 4 },
    { date: '18 feb', entregados: 25, confirmados: 18, demos: 10, ventas: 7 },
    { date: '19 feb', entregados: 22, confirmados: 15, demos: 9, ventas: 6 },
    { date: '20 feb', entregados: 30, confirmados: 22, demos: 12, ventas: 9 },
];

export function HistoricalTable() {
    return (
        <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-white">Histórico Últimos 8 Días Laborales</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary/50">
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Entregados</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Confirmados</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Demos</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Ventas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-white">{row.date}</td>
                                <td className="px-6 py-4 text-sm text-center text-zinc-300">{row.entregados}</td>
                                <td className="px-6 py-4 text-sm text-center text-zinc-300">{row.confirmados}</td>
                                <td className="px-6 py-4 text-sm text-center text-zinc-300">{row.demos}</td>
                                <td className="px-6 py-4 text-sm text-center font-bold text-primary">{row.ventas}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
