const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('debug_tareas_results.html', 'utf8');
const $ = cheerio.load(html);

const tables = $('table');
console.log("Total tables:", tables.length);

tables.each((i, table) => {
    const text = $(table).text().replace(/\s+/g, ' ').trim().slice(0, 100);
    if(text.length > 20) console.log(`Table ${i}: ${text}`);
});
