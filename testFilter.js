const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./public/crm_data.json', 'utf8'));

const appliedFilter = "PATROCINIO SANCHEZ LASTRE";

const isMatchComercial = (row) => {
  const normalizedRow = row.replace(/[\s\t\n\r]+/g, ' ').trim().toUpperCase();
  const upperFilter = appliedFilter.toUpperCase();
  const user = d.usuarios.find((u) => u.nombre === appliedFilter);

  if (user && user.login) {
    return normalizedRow.includes(user.login.toUpperCase()) || normalizedRow.includes(upperFilter);
  }
  return normalizedRow.includes(upperFilter);
};

const filterTarea = (row) => {
  if (typeof row !== 'string') return false;
  const rowClean = row.trim().toUpperCase();
  if (!rowClean || !/^\s*\d+\.\s*/.test(row)) return false;
  return isMatchComercial(row);
};

const tareasFiltradas = (d.tareas || []).filter(filterTarea);
console.log("Tareas for " + appliedFilter + ": " + tareasFiltradas.length);
fs.writeFileSync('debug_patrocinio.txt', tareasFiltradas.join('\n\n---\n\n'));
