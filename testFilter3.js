const d = require('./public/crm_data.json');

const tareas = d.tareas.filter(r => /^\s*\d+\.\s*/.test(r));
console.log("Total parsed tareas:", tareas.length);

const start = new Date(2026, 1, 1); // 1 feb 2026
const end = new Date(2026, 1, 24, 23, 59, 59); // 24 feb 2026

const isMatchDate = (row) => {
    const dateMatch = row.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!dateMatch) return true;
    const rowDate = new Date(dateMatch[3], dateMatch[2]-1, dateMatch[1], 0, 0, 0, 0);
    return rowDate >= start && rowDate <= end;
};

const dateFiltered = tareas.filter(isMatchDate);
console.log("Date filtered (1-24 feb):", dateFiltered.length);

const teleoperadoras = d.usuarios.filter(u => u.tipo === 'TELEOPERADORA' || u.tipo.includes('COOR TELEOPERADORAS')).map(u => u.nombre);

const isMatchComercial = (row) => {
    const normalizedRow = row.replace(/[\s\t\n\r]+/g, ' ').trim().toUpperCase();
    for (const userName of teleoperadoras) {
        const uObj = d.usuarios.find(u => u.nombre === userName);
        if (uObj && uObj.login && new RegExp(`\\b${uObj.login.toUpperCase()}\\b`).test(normalizedRow)) return true;
        if (normalizedRow.includes(userName.toUpperCase())) return true;
    }
    return false;
};

const dateAndUserFiltered = dateFiltered.filter(isMatchComercial);
console.log("Date and User filtered:", dateAndUserFiltered.length);

// See which ones are failing user match
const failed = dateFiltered.filter(t => !isMatchComercial(t));
console.log("Failed user match sample:");
console.log(failed.slice(0, 3).map(r => r.split('\t').slice(0,5).join(' | ')).join('\n'));
