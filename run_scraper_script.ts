import { scrapeCRMData } from './src/lib/scraper';
import * as fs from 'fs';

async function run() {
    console.log('Running scraper...');
    try {
        const result = await scrapeCRMData('VICTOR', 'VICTOR');
        console.log('Scrape result:', result.success);
        if (result.success) {
            fs.writeFileSync('public/crm_data.json', JSON.stringify(result.data, null, 2));
            console.log('Scraping successful. Data saved to public/crm_data.json');
        } else {
            console.error('Scraping failed:', result?.error);
        }
    } catch (err) {
        console.error('Error running scraper:', err);
    }
}

run();
