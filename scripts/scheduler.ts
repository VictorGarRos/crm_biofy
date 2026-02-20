
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { scrapeCRMData } from '../src/lib/scraper';

const CREDENTIALS = {
    username: 'VICTOR',
    password: 'VICTOR'
};

const DATA_FILE = path.join(process.cwd(), 'public', 'crm_data.json');

async function runScraper() {
    console.log(`[${new Date().toISOString()}] Starting scheduled scrape...`);
    try {
        const result = await scrapeCRMData(CREDENTIALS.username, CREDENTIALS.password);

        if (result.success && result.data) {
            console.log(`[${new Date().toISOString()}] Scrape successful. Saving to ${DATA_FILE}...`);
            fs.writeFileSync(DATA_FILE, JSON.stringify(result.data, null, 2));
            console.log(`[${new Date().toISOString()}] Data saved.`);
        } else {
            console.error(`[${new Date().toISOString()}] Scrape failed:`, result.error);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Scheduler error:`, error);
    }
}

// Schedule task to run every 6 hours (at minute 0)
// '0 */6 * * *' -> At minute 0 past hour 0, 6, 12, 18.
cron.schedule('0 */6 * * *', runScraper);

console.log('CRM Scraper Scheduler started.');
console.log('Task scheduled for every 6 hours (0 */6 * * *).');

// Run immediately on start
runScraper();
