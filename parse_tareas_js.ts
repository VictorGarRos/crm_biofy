import fs from 'fs';
const html = fs.readFileSync('form_tareas.html', 'utf8');

const regex = /function buscar[^{]*\{[^}]*\}/;
const match = html.match(regex);
console.log(match ? match[0] : 'Function not found');
