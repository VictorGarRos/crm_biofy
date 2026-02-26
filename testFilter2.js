const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./public/crm_data.json', 'utf8'));

const appliedFilter = "PATROCINIO SANCHEZ LASTRE";
const upperFilter = appliedFilter.toUpperCase();
const user = d.usuarios.find(u => u.nombre === appliedFilter);
const login = user ? user.login.toUpperCase() : '';

const filterTarea = (row) => {
  if (typeof row !== 'string') return false;
  const rowClean = row.trim().toUpperCase();
  if (!rowClean || !/^\s*\d+\.\s*/.test(row)) return false;
  
  const normalizedRow = row.replace(/[\s\t\n\r]+/g, ' ').trim().toUpperCase();
  const isMatchComercial = normalizedRow.includes(login) || normalizedRow.includes(upperFilter);
  return isMatchComercial;
};

const tareas = (d.tareas || []).filter(filterTarea);
console.log("Tareas length in dashboard logic:", tareas.length);

const crmStarts = ["01/02", "02/02", "03/02"]; // etc
const numFeb = tareas.filter(t => !t.includes('31/01/2026')).length;
console.log("Tareas in Feb:", numFeb);

