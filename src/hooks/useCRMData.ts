
'use client';

import { useState, useEffect } from 'react';

interface CRMData {
    timestamp: string;
    metrics: {
        entregados: number;
        confirmados: number;
        demos: number;
        ventas: number;
    };
    filters?: {
        comerciales: string[];
        tipos: string[];
    };
    raw: {
        eventos: string[];
        pedidos: string[];
    };
}

export function useCRMData() {
    const [data, setData] = useState<CRMData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/crm_data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch CRM data');
                }
                const jsonData = await response.json();

                // Parse metrics from raw data
                const eventos = jsonData.eventos || [];
                const pedidos = jsonData.pedidos || [];

                // Simple keyword counting based on valid mapping
                // DATOS ENTREGADOS = BUSCAR EN EVENTOS (INSTALACION + ENTREGA)
                const entregados = eventos.filter((r: string) => r.includes('INSTALACION') || r.includes('ENTREGA')).length;

                // DEMOS REALIZADAS = BUSCAR EN EVENTOS (VISITA)
                const demos = eventos.filter((r: string) => r.includes('VISITA')).length;

                // CONFIRMADOS = BUSCAR EN EVENTOS (Checking for a 'CONFIRMADO' or positive status in events)
                // If not found, fallback to Pedidos 'CONFIRMADO' if logic is ambiguous, but user said Eventos.
                // Looking at sample data, Eventos row 12 has "PENDIENTE", "NULO". 
                // Maybe "CONFIRMADO" exists? I'll count it if present.
                const confirmados = eventos.filter((r: string) => r.includes('CONFIRMADO')).length;

                // VENTAS CERRADAS = PEDIDOS (CERRADO + CONFIRMADO in Pedidos?)
                // User said "VENTAS CERRADAS = PEDIDOS".
                // In Pedidos we saw "CERRADO COMERCIAL", "CONFIRMADO".
                const ventas = pedidos.filter((r: string) => r.includes('CERRADO') || r.includes('CONFIRMADO')).length;

                // Parse unique filters
                const uniqueComerciales = new Set<string>();
                const uniqueTipos = new Set<string>();

                // Helper to clean and add to set
                const processRow = (row: string) => {
                    const parts = row.split('\t');
                    // Index 3 is usually Usage/Comercial (confirmed via debug)
                    if (parts.length > 3) {
                        const rawName = parts[3] || '';
                        // Clean up: remove \n, trim
                        const name = rawName.replace(/[\n\r]+/g, '').trim();

                        if (name && name.length > 2 && !name.includes('Usuario') && !name.includes('Producto')) { // Basic filter
                            uniqueComerciales.add(name);
                        }
                    }

                    // Look for Type. It's often around index 6-8
                    for (let i = 5; i < parts.length; i++) {
                        const val = parts[i].trim();
                        if (['VISITA', 'MANTENIMIENTO', 'INSTALACION', 'ENTREGA', 'INCIDENCIA', 'RECOGIDA', 'TRASLADO', 'VENTA'].includes(val)) {
                            uniqueTipos.add(val);
                            break;
                        }
                    }
                };

                eventos.forEach(processRow);

                setData({
                    timestamp: jsonData.timestamp,
                    metrics: {
                        entregados,
                        confirmados,
                        demos,
                        ventas
                    },
                    filters: {
                        comerciales: Array.from(uniqueComerciales).sort(),
                        tipos: Array.from(uniqueTipos).sort()
                    },
                    raw: {
                        eventos,
                        pedidos
                    }
                });
            } catch (err) {
                // If file doesn't exist (e.g. first run), use fallback or 0
                console.error(err);
                setError('No CRM specific data found');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}
