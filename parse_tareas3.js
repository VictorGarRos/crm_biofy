const data = require('./public/crm_data.json');
const realTareas = data.tareas.filter(r => !r.includes('Sem Act') && !r.includes('Sem Prox') && r.match(/^\d+\./));
console.log(realTareas.slice(0, 3).join('\n'));
