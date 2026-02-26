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

        const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
        if (btn) btn.click();
        else document.forms[0].submit();
    });
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const html = await page.content();
    fs.writeFileSync('debug_tareas_results.html', html);
    
    console.log("Written length:", html.length);
    await browser.close();
}

run();
