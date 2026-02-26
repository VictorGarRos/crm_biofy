
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

    await page.goto('https://engloba.crmsmi.com/sm/agenda/listados/fmodificar.asp');
    await page.evaluate(() => {
        const btn = document.querySelector('input[type="submit"][value="Buscar"]');
        if (btn) btn.click();
        else document.forms[0].submit();
    });
    await page.waitForNavigation();

    const html = await page.evaluate(() => {
        const table = document.querySelector('table');
        return table ? table.outerHTML : 'No table';
    });

    fs.writeFileSync('debug_table.html', html);
    await browser.close();
}

run();
