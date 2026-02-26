const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
    console.log("Starting browser...");
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
        
        const ffdesde = document.querySelector('input[name="ffdesde"]');
        if (ffdesde) ffdesde.value = formattedDate;
        
        const ffhasta = document.querySelector('input[name="ffhasta"]');
        if (ffhasta) ffhasta.value = formattedDate;
        
        const ddesde = document.querySelector('input[name="ddesde"]');
        if (ddesde) ddesde.checked = true;
        
        const hhasta = document.querySelector('input[name="hhasta"]');
        if (hhasta) hhasta.checked = true;

        if (typeof window.buscar === 'function') {
            window.buscar(0);
        } else {
            console.error('buscar(0) not found');
        }
    });
    
    console.log("Waiting for navigation...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("Current URL after search:", page.url());
    
    const html = await page.content();
    fs.writeFileSync('debug_tareas_results_4.html', html);
    
    const rowsFound = await page.evaluate(() => {
        return document.querySelectorAll('tr').length;
    });
    
    console.log("Rows total:", rowsFound);
    await browser.close();
}

run().catch(console.error);
