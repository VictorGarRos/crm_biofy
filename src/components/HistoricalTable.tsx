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
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="px-8 py-6 text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200">Fecha</th>
                            <th className="px-8 py-6 text-xs font-bold text-slate-700 uppercase tracking-widest text-center border-b border-slate-200">Entregados</th>
                            <th className="px-8 py-6 text-xs font-bold text-slate-700 uppercase tracking-widest text-center border-b border-slate-200">Confirmados</th>
                            <th className="px-8 py-6 text-xs font-bold text-slate-700 uppercase tracking-widest text-center border-b border-slate-200">Demos</th>
                            <th className="px-8 py-6 text-xs font-bold text-slate-700 uppercase tracking-widest text-center border-b border-slate-200">Ventas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5 text-sm font-medium text-slate-400 border-b border-slate-100 group-last:border-0">{row.date}</td>
                                <td className="px-8 py-5 text-sm text-center font-medium text-slate-300 border-b border-slate-100 group-last:border-0">{row.entregados}</td>
                                <td className="px-8 py-5 text-sm text-center font-medium text-slate-300 border-b border-slate-100 group-last:border-0">{row.confirmados}</td>
                                <td className="px-8 py-5 text-sm text-center font-medium text-slate-300 border-b border-slate-100 group-last:border-0">{row.demos}</td>
                                <td className="px-8 py-5 text-sm text-center font-bold text-[#a78bfa] border-b border-slate-100 group-last:border-0">{row.ventas}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
