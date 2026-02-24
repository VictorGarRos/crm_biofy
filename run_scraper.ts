import { scrapeCRMData } from './src/lib/scraper';
import fs from 'fs';

async function run() {
    console.log('Running scraper...');
    const result = await scrapeCRMData('VICTOR', 'VICTOR');
    if (result.success) {
        fs.writeFileSync('public/crm_data.json', JSON.stringify(result.data, null, 2));
        console.log('Scraping successful. Data saved to public/crm_data.json');
    } else {
        console.error('Scraping failed:', result.error);
    }
}

run();
