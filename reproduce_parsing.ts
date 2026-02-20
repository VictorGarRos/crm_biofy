
const fs = require('fs');
const path = require('path');

try {
    const jsonPath = path.join(process.cwd(), 'public', 'crm_data.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    const eventos = jsonData.eventos || [];
    console.log(`Loaded ${eventos.length} events from crm_data.json`);

    const uniqueComerciales = new Set<string>();

    const processRow = (row: string, index: number) => {
        const parts = row.split('\t');
        if (index < 3) {
            console.log(`\nRow ${index} parts length: ${parts.length}`);
            console.log(`Row ${index} part[2] raw: ${JSON.stringify(parts[2])}`);
            console.log(`Row ${index} part[3] raw: ${JSON.stringify(parts[3])}`);
        }

        if (parts.length > 3) {
            const rawName = parts[3] || '';
            // Match the regex exactly from useCRMData.ts
            const name = rawName.replace(/[\n\r]+/g, '').trim();

            if (index < 3) {
                console.log(`Row ${index} extracted name: "${name}"`);
            }

            if (name && name.length > 2 && !name.includes('Usuario')) {
                uniqueComerciales.add(name);
            }
        }
    };

    eventos.forEach((row: string, i: number) => processRow(row, i));

    console.log('\n--- Extraction Results ---');
    console.log(`Total Unique Users Found: ${uniqueComerciales.size}`);
    console.log('List:', Array.from(uniqueComerciales).sort());

} catch (err) {
    console.error('Error:', err);
}
