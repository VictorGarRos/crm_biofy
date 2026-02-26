import { scrapeCRMData } from './src/lib/scraper';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Starting forced scrape for Tareas...");
    const result = await scrapeCRMData('VICTOR', 'VICTOR');
    if(result.success) {
        fs.writeFileSync(path.join(process.cwd(), 'public', 'crm_data.json'), JSON.stringify(result.data, null, 2));
        console.log("Saved.");
    } else {
        console.error("Failed:", result.error);
    }
}
main();
