"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scraper_1 = require("../src/lib/scraper");
const CREDENTIALS = {
    username: 'VICTOR',
    password: 'VICTOR'
};
const DATA_FILE = path_1.default.join(process.cwd(), 'public', 'crm_data.json');
async function runScraper() {
    console.log(`[${new Date().toISOString()}] Starting scheduled scrape...`);
    try {
        const result = await (0, scraper_1.scrapeCRMData)(CREDENTIALS.username, CREDENTIALS.password);
        if (result.success && result.data) {
            console.log(`[${new Date().toISOString()}] Scrape successful. Saving to ${DATA_FILE}...`);
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(result.data, null, 2));
            console.log(`[${new Date().toISOString()}] Data saved.`);
        }
        else {
            console.error(`[${new Date().toISOString()}] Scrape failed:`, result.error);
        }
    }
    catch (error) {
        console.error(`[${new Date().toISOString()}] Scheduler error:`, error);
    }
}
// Schedule task to run every 6 hours (at minute 0)
// '0 */6 * * *' -> At minute 0 past hour 0, 6, 12, 18.
node_cron_1.default.schedule('0 */6 * * *', runScraper);
console.log('CRM Scraper Scheduler started.');
console.log('Task scheduled for every 6 hours (0 */6 * * *).');
// Run immediately on start
runScraper();
