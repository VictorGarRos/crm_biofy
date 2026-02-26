const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('https://engloba.crmsmi.com/', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
        const u = document.querySelector('input[name="login"]');
        const p = document.querySelector('input[name="password"]');
        if (u) u.value = "VICTOR";
        if (p) p.value = "VICTOR";
        const btn = document.querySelector('input[type="submit"]');
        if (btn) btn.click();
        else if(document.forms.length > 0) document.forms[0].submit();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});

    await page.goto('https://engloba.crmsmi.com/sm/tareas/mod/fmodificar.asp', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        const ffdesde = document.querySelector('input[name="ffdesde"]');
        if (ffdesde) ffdesde.value = "01/02/2026";
        const ffhasta = document.querySelector('input[name="ffhasta"]');
        if (ffhasta) ffhasta.value = "28/02/2026";
        const ddesde = document.querySelector('input[name="ddesde"]');
        if (ddesde) ddesde.checked = true;
        const hhasta = document.querySelector('input[name="hhasta"]');
        if (hhasta) hhasta.checked = true;
        
        const equipo = document.querySelector('select[name="equipo"]');
        if (equipo) equipo.value = "6";
        const cequipo = document.querySelector('input[name="cequipo"]');
        if (cequipo) cequipo.checked = true;

        const fdesde = document.querySelector('input[name="fdesde"]');
        if (fdesde) fdesde.value = "";
        const fhasta = document.querySelector('input[name="fhasta"]');
        if (fhasta) fhasta.value = "";

        if (document.forms.namedItem('btareas')) {
            const form = document.forms.namedItem('btareas');
            if (form.action.indexOf('bdatos') === -1) {
                form.action += '&bdatos=10000';
            }
            form.submit();
        }
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise(r => setTimeout(r, 4000));

    const html = await page.content();
    fs.writeFileSync('tareas_results.html', html);
    
    const tasks = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        return rows.filter(r => r.cells.length > 5 && r.innerText.trim().length > 10).map(r => r.innerText);
    });
    console.log("Tasks extracted:", tasks.length);
    
    await browser.close();
})();
