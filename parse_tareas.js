const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('debug_tareas_results.html', 'utf8');
const $ = cheerio.load(html);

// Find the table that has the actual results. Usually it's a large table.
const rows = $('tr').filter((i, el) => {
    return $(el).text().includes('Nº') || $(el).attr('bgcolor') === '#e8e8e8' || $(el).attr('bgcolor') === '#FFFFFF';
});

let output = [];
rows.slice(0, 10).each((i, el) => {
    let rowData = [];
    $(el).find('td, th').each((j, td) => {
        rowData.push($(td).text().replace(/\s+/g, ' ').trim());
    });
    output.push(rowData);
});

console.log(JSON.stringify(output, null, 2));
