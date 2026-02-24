
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
        cuentas: string[];
    };
    raw: {
        eventos: string[];
        pedidos: string[];
        usuarios?: { login: string; nombre: string; tipo: string; rawRow: string; cells: string[] }[];
    };
    lastUpdate?: string;
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
                const usuarios = jsonData.usuarios || [];

                // DATOS ENTREGADOS = Todos los eventos asignados
                const entregados = eventos.length;

                // CONFIRMADOS = Eventos con estado CONFIRMADO
                const confirmados = eventos.filter((r: string) => r.includes('CONFIRMADO')).length;

                // DEMOS REALIZADAS = Eventos con estado COMPLETADO
                const demos = eventos.filter((r: string) => r.includes('COMPLETADO')).length;

                // VENTAS CERRADAS = Total de pedidos (excluyendo cabeceras y mantenimientos)
                const realPedidos = pedidos.filter((r: string) => {
                    const row = r.trim().toUpperCase();
                    if (!row || row.startsWith('PEDIDO') || row.includes('IMP.INGRE')) return false;
                    // Exclude maintenance orders
                    if (row.includes('MANT.') || row.includes('MANTENIMIENTO')) return false;
                    return true;
                });
                const ventas = realPedidos.length;

                // Filter Comercial Dropdown directly from the extracted Users table
                const validTypes = ['COMERCIAL', 'TECNICO'];
                const comercialesList = usuarios
                    .filter((u: any) => validTypes.includes(u.tipo.toUpperCase()))
                    .map((u: any) => u.nombre.trim())
                    .filter((n: string) => n.length > 0);

                // Keep the set to ensure uniqueness and sort
                const uniqueComerciales = new Set<string>(comercialesList);
                const uniqueTipos = new Set<string>();

                // Helper to clean and add to set
                const processRow = (row: string) => {
                    const parts = row.split('\t');

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

                // Use specific account types requested by the user
                const cuentasMap = ['POTENCIAL', 'CLIENTE', 'VIP', 'ALQUILER', 'VIP BIOFY'];

                setData({
                    timestamp: jsonData.timestamp,
                    metrics: {
                        entregados: entregados,
                        confirmados: confirmados,
                        demos: demos,
                        ventas: ventas
                    },
                    filters: {
                        comerciales: Array.from(uniqueComerciales).sort(),
                        tipos: Array.from(uniqueTipos).sort(),
                        cuentas: Array.from(cuentasMap).sort()
                    },
                    raw: {
                        eventos,
                        pedidos,
                        usuarios
                    },
                    lastUpdate: new Date().toISOString(),
                });
            } catch (err) {
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
