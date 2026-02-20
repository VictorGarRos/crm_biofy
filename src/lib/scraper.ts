import puppeteer from 'puppeteer';

interface ScrapeResult {
    success: boolean;
    data?: {
        eventos: string[];
        pedidos: string[];
        timestamp: string;
    };
    error?: string;
}

export async function scrapeCRMData(username: string, password: string): Promise<ScrapeResult> {
    let browser;
    try {
        console.log('Starting scraper...');
        browser = await puppeteer.launch({
            headless: true, // Run in background
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-zygote']
        });

        const page = await browser.newPage();
        // Set higher timeout for slow legacy systems
        page.setDefaultNavigationTimeout(60000);

        // 1. Login
        console.log('Logging in...');
        await page.goto('https://engloba.crmsmi.com/sm/acceso.asp', { waitUntil: 'networkidle0' });
        await page.type('input[name="login"]', username);
        await page.type('input[name="password"]', password);

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('input[type="submit"]')
        ]);

        // Validate Login
        if (page.url().includes('acceso.asp')) {
            // Check for error message on page
            const errorText = await page.evaluate(() => document.body.innerText);
            if (errorText.includes('incorrecto') || errorText.includes('failed')) {
                throw new Error('Login failed: Invalid credentials');
            }
            throw new Error('Login failed: Still on login page');
        }

        // Helper to get date string YYYY-MM-DD
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // SAFETY: Strictly READ-ONLY operations below. 
        // We only use the "Search" (Buscar) forms. We do NOT interact with "Guardar", "Borrar", or "Nuevo".

        // 2. Scrape Eventos
        console.log('Scraping Eventos (Read-Only)...');
        // Note: 'fmodificar.asp' is the search/filter form in this legacy system, not an edit action itself.
        await page.goto('https://engloba.crmsmi.com/sm/agenda/listados/fmodificar.asp', { waitUntil: 'networkidle2' });

        // Fill date range and submit SEARCH only
        await page.evaluate((start: string, end: string) => {
            // ... (keeping existing logic for filling search form) ...
            // Try to fill 'fdesde'/'fhasta' (bottom inputs usually)
            const fdesde = document.querySelector<HTMLInputElement>('input[name="fdesde"]');
            if (fdesde) {
                fdesde.value = start;
                document.querySelector<HTMLInputElement>('input[name="fhasta"]')!.value = end;
                const checkFrom = document.querySelector<HTMLInputElement>('input[name="desde"]');
                if (checkFrom) checkFrom.checked = true;
                const checkTo = document.querySelector<HTMLInputElement>('input[name="hasta"]');
                if (checkTo) checkTo.checked = true;
            } else {
                // Fallback to 'mfdesde'
                const mfdesde = document.querySelector<HTMLInputElement>('input[name="mfdesde"]');
                if (mfdesde) {
                    mfdesde.value = start;
                    document.querySelector<HTMLInputElement>('input[name="mfhasta"]')!.value = end;
                    const checkFrom = document.querySelector<HTMLInputElement>('input[name="cmfdesde"]');
                    if (checkFrom) checkFrom.checked = true;
                    const checkTo = document.querySelector<HTMLInputElement>('input[name="cmfhasta"]');
                    if (checkTo) checkTo.checked = true;
                }
            }

            // Submit using the Search button
            const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
            if (btn) btn.click();
            else (document.forms[0] as HTMLFormElement).submit();
        }, formatDate(startOfMonth), formatDate(today));

        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Parse Eventos Table
        const eventos = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.filter(r => r.innerText.includes('VISITA') || r.innerText.includes('DATOS ENTREGADOS') || r.cells.length > 5).map(r => r.innerText);
        });

        // Small delay to be polite to the server
        await new Promise(r => setTimeout(r, 2000));

        // 3. Scrape Pedidos
        console.log('Scraping Pedidos (Read-Only)...');
        await page.goto('https://engloba.crmsmi.com/sm/pedidos/mod/fmodificar.asp', { waitUntil: 'networkidle2' });

        // Fill date range and submit SEARCH only
        await page.evaluate((start: string, end: string) => {
            const fdesde = document.querySelector<HTMLInputElement>('input[name="fdesde"]');
            if (fdesde) {
                fdesde.value = start;
                document.querySelector<HTMLInputElement>('input[name="fhasta"]')!.value = end;
                const checkFrom = document.querySelector<HTMLInputElement>('input[name="desde"]');
                if (checkFrom) checkFrom.checked = true;
                const checkTo = document.querySelector<HTMLInputElement>('input[name="hasta"]');
                if (checkTo) checkTo.checked = true;
            }

            // Submit Search
            const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
            if (btn) btn.click();
            else (document.querySelector('form[name="ped_mod"]') as HTMLFormElement).submit();
        }, formatDate(startOfMonth), formatDate(today));

        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Parse Pedidos Table
        const pedidos = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.filter(r => r.innerText.includes('PENDIENTE') || r.innerText.includes('CONFIRMADO') || r.cells.length > 5).map(r => r.innerText);
        });

        console.log(`Scraped ${eventos.length} potential events and ${pedidos.length} potential orders.`);

        return {
            success: true,
            data: {
                eventos: eventos,
                pedidos: pedidos,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Scraping failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    } finally {
        if (browser) await browser.close();
    }
}
