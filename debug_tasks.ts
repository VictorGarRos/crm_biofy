
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/crm_data.json', 'utf8'));
const uniqueTareas = new Set();

data.eventos.forEach((row: string) => {
    const parts = row.split('\t');
    for (let i = 5; i < parts.length; i++) {
        const val = parts[i].trim();
        if (['VISITA', 'MANTENIMIENTO', 'INSTALACION', 'ENTREGA', 'INCIDENCIA', 'RECOGIDA', 'TRASLADO', 'VENTA'].includes(val)) {
            if (parts[i + 1]) {
                const task = parts[i + 1].trim();
                if (task && task.length < 100 && !['VISITA', 'MANTENIMIENTO', 'INSTALACION', 'ENTREGA', 'INCIDENCIA', 'RECOGIDA', 'TRASLADO', 'VENTA', 'CONFIRMADO', 'COMPLETADO', 'PENDIENTE', 'ANULADO'].includes(task)) {
                    uniqueTareas.add(task);
                }
            }
            break;
        }
    }
});

console.log(Array.from(uniqueTareas));
