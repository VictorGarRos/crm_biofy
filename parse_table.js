const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('debug_table.html', 'utf8');
const $ = cheerio.load(html);
$('tr').slice(0, 3).each((i, el) => {
    console.log(`Row ${i}:`);
    $(el).find('td').each((j, td) => {
        console.log(`  Col ${j}: ${$(td).text().trim().replace(/[\n\r\t]+/g, ' ')}`);
    });
});
