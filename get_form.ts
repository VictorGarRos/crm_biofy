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
    const content = await page.content();
    fs.writeFileSync('form.html', content);
    await browser.close();
}

run();
