const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./public/crm_data.json', 'utf8'));

const tasks = (d.tareas || []).filter(r => /^\s*\d+\.\s*/.test(r));
console.log('Total tasks inside JSON currently:', tasks.length);

