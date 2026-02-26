import fs from 'fs';
const data = JSON.parse(fs.readFileSync('public/crm_data.json', 'utf8'));
const tareas = data.tareas || [];

const today = new Date();
today.setHours(0, 0, 0, 0);

const isMatchDate = (row: string) => {
    // Dates usually appear in the 1st or 2nd field of the row separated by \t, e.g. "02/02/2026 8:30:00"
    const dateMatch = row.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!dateMatch) return true;

    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // 0-indexed
    const year = parseInt(dateMatch[3]);

    const rowDate = new Date(year, month, day);
    rowDate.setHours(0, 0, 0, 0);

    // The user had no explicit date filters initially, so we check default dashboard behavior 
    // Wait... if dateRange is undefined, isMatchDate returns true. 
    // Does the dashboard show "today's metrics" by default or ALL metrics from the month/week?
    // User said "Me sale 19 registros en tareas hoy, y en el dashboard 0"
    // Usually, people select "Today" on the dashboard filters. Let's act as if they selected today.
    return rowDate.getTime() === today.getTime();
};

const filterTarea = (row: string) => {
    if (typeof row !== 'string') return false;
    const rowClean = row.trim().toUpperCase();
    if (!rowClean || !/^\s*\d+\.\s*/.test(row)) return false;
    return isMatchDate(row); // skipping other filters for now to count total today
};

const filterTareaTotal = (row: string) => {
    if (typeof row !== 'string') return false;
    const rowClean = row.trim().toUpperCase();
    if (!rowClean || !/^\s*\d+\.\s*/.test(row)) return false;
    return true;
};

const todayTareas = tareas.filter(filterTarea);
console.log("Total valid tareas in scrape:", tareas.filter(filterTareaTotal).length);
console.log("Tareas for today (25/02/2026) under regex:", todayTareas.length);
