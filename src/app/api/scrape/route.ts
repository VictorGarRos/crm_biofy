import { NextResponse } from 'next/server';
import { scrapeCRMData } from '@/lib/scraper';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        console.log("Starting forced API scrape...");
        const result = await scrapeCRMData('VICTOR', 'VICTOR');
        
        if (result.success && result.data) {
            const dataPath = path.join(process.cwd(), 'public', 'crm_data.json');
            fs.writeFileSync(dataPath, JSON.stringify(result.data, null, 2));
            return NextResponse.json({ success: true, message: "Data scraped and saved successfully." });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
