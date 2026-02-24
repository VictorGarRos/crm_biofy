
const fs = require('fs');
const path = require('path');

try {
    const jsonPath = path.join(process.cwd(), 'public', 'crm_data.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    const eventos = jsonData.eventos || [];
    console.log(`Loaded ${eventos.length} events from crm_data.json`);

    const clientMap = new Map<string, Set<string>>();

    const processRow = (row: string, index: number) => {
        const parts = row.split('\t');

        // Excluded Admin/Office users
        const EXCLUDED_USERS = [
            'INMACULADA ORTEGA TAPIA',
            'JEYVER',
            'FERNANDO JOSE MARISCAL CLARO',
            'JAVIER IBAÑEZ JURADO',
            'VICTOR GARCIA ROSAL',
            'CARLOS TARANCON CANO',
            'CARLOS TARANCON'
        ];

        if (parts.length > 7) {
            const rawName = parts[3] || '';
            const name = rawName.replace(/[\n\r]+/g, '').trim();

            if (
                name &&
                name.length > 2 &&
                !name.includes('Usuario') &&
                !EXCLUDED_USERS.includes(name)
            ) {
                if (!clientMap.has(name)) {
                    clientMap.set(name, new Set());
                }
                const clientInfo = parts[7];
                const clientName = clientInfo.split('\n')[0].trim();
                if (clientName && clientName.length > 2) {
                    clientMap.get(name)!.add(clientName);
                }
            }
        }
    };

    eventos.forEach((row: string, i: number) => processRow(row, i));

    console.log('\n--- Extraction Results ---');
    console.log(`Total Unique Comercial Users: ${clientMap.size}`);
    clientMap.forEach((clients, name) => {
        console.log(`${name}: ${clients.size} clients`);
    });

} catch (err) {
    console.error('Error:', err);
}
