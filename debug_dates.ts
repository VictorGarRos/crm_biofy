import fs from 'fs';
const data = JSON.parse(fs.readFileSync('public/crm_data.json', 'utf8'));
const tareas = data.tareas || [];

const dates = [];
tareas.forEach((row: string) => {
    const match = row.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if(match) dates.push(match[0]);
});

console.log("First 10 distinct dates:");
console.log(Array.from(new Set(dates)).slice(0, 10));

console.log("Last 10 distinct dates:");
const uniqueDates = Array.from(new Set(dates));
console.log(uniqueDates.slice(Math.max(0, uniqueDates.length - 10)));
