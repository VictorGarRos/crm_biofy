import puppeteer from 'puppeteer';

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
    const inputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input[type="text"], input[type="radio"], input[type="checkbox"], select, span')).map(el => {
            // Get label text around or near the input
            let label = '';
            if (el.tagName === 'SPAN') return { kind: 'span', text: el.innerText };
            
            const parent = el.closest('td, div');
            if(parent) label = parent.innerText.trim();
            
            return {
                name: el.getAttribute('name'),
                type: el.tagName === 'INPUT' ? el.getAttribute('type') : 'select',
                value: el.getAttribute('value'),
                label
            };
        }).filter(e => e.name || e.kind === 'span');
    });

    console.log(JSON.stringify(inputs, null, 2));
    await browser.close();
}

run();
