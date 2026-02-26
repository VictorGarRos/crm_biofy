const puppeteer = require('puppeteer');

async function check() {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        console.log("Browser launched");
        const page = await browser.newPage();
        await page.goto('https://engloba.crmsmi.com/sm/acceso.asp', { waitUntil: 'networkidle0' });
        await page.type('input[name="login"]', 'VICTOR');
        await page.type('input[name="password"]', 'VICTOR');
        await Promise.all([
            page.waitForNavigation(),
            page.click('input[type="submit"]')
        ]);

        console.log("Logged in");
        await page.goto('https://engloba.crmsmi.com/sm/tareas/mod/fmodificar.asp', { waitUntil: 'networkidle2' });
        const html = await page.evaluate(() => {
            const i1 = document.querySelector('input[name="ffdesde"]');
            const i2 = document.querySelector('input[name="ffhasta"]');
            return {
                ffdesde: i1 ? i1.outerHTML : 'null',
                ffhasta: i2 ? i2.outerHTML : 'null'
            };
        });
        console.log("HTML:", html);
        await browser.close();
    } catch (err) {
        console.error(err);
    }
}
check();
