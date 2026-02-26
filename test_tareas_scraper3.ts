import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://engloba.crmsmi.com/sm/acceso.asp');
    await page.type('input[name="login"]', 'VICTOR');
    await page.type('input[name="password"]', 'VICTOR');
    await Promise.all([
        page.waitForNavigation(),
        page.click('input[type="submit"]')
    ]);

    await page.goto('https://engloba.crmsmi.com/sm/tareas/mod/fmodificar.asp');
    
    // Fill the ffdesde and ffhasta fields with today's date
    await page.evaluate(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        const ffdesde = document.querySelector<HTMLInputElement>('input[name="ffdesde"]');
        if (ffdesde) ffdesde.value = formattedDate;
        
        const ffhasta = document.querySelector<HTMLInputElement>('input[name="ffhasta"]');
        if (ffhasta) ffhasta.value = formattedDate;
        
        const ddesde = document.querySelector<HTMLInputElement>('input[name="ddesde"]');
        if (ddesde) ddesde.checked = true;
        
        const hhasta = document.querySelector<HTMLInputElement>('input[name="hhasta"]');
        if (hhasta) hhasta.checked = true;

        // Try to call the specific buscar function
        if (typeof (window as any).buscar === 'function') {
            (window as any).buscar(0);
        } else {
            console.error('buscar(0) not found');
        }
    });
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log("Current URL after search:", page.url());
    
    const html = await page.content();
    fs.writeFileSync('debug_tareas_results_3.html', html);
    
    const rowsFound = await page.evaluate(() => {
        return document.querySelectorAll('tr').length;
    });
    
    console.log("Rows total:", rowsFound);
    await browser.close();
}

run();
