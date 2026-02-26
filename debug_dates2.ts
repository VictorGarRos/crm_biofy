import fs from 'fs';
const data = JSON.parse(fs.readFileSync('public/crm_data.json', 'utf8'));
const tareas = data.tareas || [];

const dates: string[] = [];
tareas.forEach((row: string) => {
    const match = row.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) dates.push(match[0]);
});

const uniqueDates = Array.from(new Set(dates));
console.log("All distinct dates:", uniqueDates);
