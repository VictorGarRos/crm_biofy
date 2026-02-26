import fs from 'fs';
const data = JSON.parse(fs.readFileSync('public/crm_data.json', 'utf8'));
const tareas = data.tareas || [];
console.log(tareas.slice(0, 5));
