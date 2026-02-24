"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeCRMData = scrapeCRMData;
const puppeteer_1 = require("puppeteer");
function scrapeCRMData(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let browser;
        try {
            console.log('Starting scraper...');
            browser = yield puppeteer_1.default.launch({
                headless: true, // Run in background
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-zygote']
            });
            const page = yield browser.newPage();
            // Set higher timeout for slow legacy systems
            page.setDefaultNavigationTimeout(60000);
            // 1. Login
            console.log('Logging in...');
            yield page.goto('https://engloba.crmsmi.com/sm/acceso.asp', { waitUntil: 'networkidle0' });
            yield page.type('input[name="login"]', username);
            yield page.type('input[name="password"]', password);
            yield Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.click('input[type="submit"]')
            ]);
            // Validate Login
            if (page.url().includes('acceso.asp')) {
                // Check for error message on page
                const errorText = yield page.evaluate(() => document.body.innerText);
                if (errorText.includes('incorrecto') || errorText.includes('failed')) {
                    throw new Error('Login failed: Invalid credentials');
                }
                throw new Error('Login failed: Still on login page');
            }
            // Helper to get date string YYYY-MM-DD
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const formatDate = (date) => date.toISOString().split('T')[0];
            // SAFETY: Strictly READ-ONLY operations below. 
            // We only use the "Search" (Buscar) forms. We do NOT interact with "Guardar", "Borrar", or "Nuevo".
            // 2. Scrape Eventos
            console.log('Scraping Eventos (Read-Only)...');
            // Note: 'fmodificar.asp' is the search/filter form in this legacy system, not an edit action itself.
            yield page.goto('https://engloba.crmsmi.com/sm/agenda/listados/fmodificar.asp', { waitUntil: 'networkidle2' });
            // Fill date range and submit SEARCH only
            yield page.evaluate((start, end) => {
                // ... (keeping existing logic for filling search form) ...
                // Try to fill 'fdesde'/'fhasta' (bottom inputs usually)
                const fdesde = document.querySelector('input[name="fdesde"]');
                if (fdesde) {
                    fdesde.value = start;
                    document.querySelector('input[name="fhasta"]').value = end;
                    const checkFrom = document.querySelector('input[name="desde"]');
                    if (checkFrom)
                        checkFrom.checked = true;
                    const checkTo = document.querySelector('input[name="hasta"]');
                    if (checkTo)
                        checkTo.checked = true;
                }
                else {
                    // Fallback to 'mfdesde'
                    const mfdesde = document.querySelector('input[name="mfdesde"]');
                    if (mfdesde) {
                        mfdesde.value = start;
                        document.querySelector('input[name="mfhasta"]').value = end;
                        const checkFrom = document.querySelector('input[name="cmfdesde"]');
                        if (checkFrom)
                            checkFrom.checked = true;
                        const checkTo = document.querySelector('input[name="cmfhasta"]');
                        if (checkTo)
                            checkTo.checked = true;
                    }
                }
                // Submit using the Search button
                const btn = document.querySelector('input[type="submit"][value="Buscar"]');
                if (btn)
                    btn.click();
                else
                    document.forms[0].submit();
            }, formatDate(startOfMonth), formatDate(today));
            yield page.waitForNavigation({ waitUntil: 'networkidle2' });
            // Parse Eventos Table
            const eventos = yield page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('tr'));
                return rows.filter(r => r.innerText.includes('VISITA') || r.innerText.includes('DATOS ENTREGADOS') || r.cells.length > 5).map(r => r.innerText);
            });
            // Small delay to be polite to the server
            yield new Promise(r => setTimeout(r, 2000));
            // 3. Scrape Pedidos
            console.log('Scraping Pedidos (Read-Only)...');
            yield page.goto('https://engloba.crmsmi.com/sm/pedidos/mod/fmodificar.asp', { waitUntil: 'networkidle2' });
            // Fill date range and submit SEARCH only
            yield page.evaluate((start, end) => {
                const fdesde = document.querySelector('input[name="fdesde"]');
                if (fdesde) {
                    fdesde.value = start;
                    document.querySelector('input[name="fhasta"]').value = end;
                    const checkFrom = document.querySelector('input[name="desde"]');
                    if (checkFrom)
                        checkFrom.checked = true;
                    const checkTo = document.querySelector('input[name="hasta"]');
                    if (checkTo)
                        checkTo.checked = true;
                }
                // Submit Search
                const btn = document.querySelector('input[type="submit"][value="Buscar"]');
                if (btn)
                    btn.click();
                else
                    document.querySelector('form[name="ped_mod"]').submit();
            }, formatDate(startOfMonth), formatDate(today));
            yield page.waitForNavigation({ waitUntil: 'networkidle2' });
            // Parse Pedidos Table
            const pedidos = yield page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('tr'));
                return rows.filter(r => r.innerText.includes('PENDIENTE') || r.innerText.includes('CONFIRMADO') || r.cells.length > 5).map(r => r.innerText);
            });
            // 4. Scrape Usuarios
            console.log('Scraping Usuarios (Read-Only)...');
            // Let's go to the main user list page instead of the search page that might not exist or require different params
            yield page.goto('https://engloba.crmsmi.com/sm/usuarios/mod/fmodificar.asp', { waitUntil: 'networkidle2' });
            // Add a console log block from evaluate to capture in puppeteer BEFORE evaluate
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            // Submit the search form to get all users
            yield page.evaluate(() => {
                console.log('Clicking search button...');
                const btn = document.querySelector('input[type="submit"][value="Buscar"]');
                if (btn) {
                    btn.click();
                }
                else {
                    const forms = document.forms;
                    if (forms.length > 0)
                        forms[0].submit();
                }
            });
            // Wait a bit for the search results to load (since it might not trigger a full navigation)
            yield new Promise(r => setTimeout(r, 4000));
            // Parse Usuarios Table
            const usuarios = yield page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('tr'));
                return rows.slice(1).map(r => {
                    const cells = Array.from(r.cells).map(c => c.innerText.trim());
                    // From logs: | Código | Foto | Login | Nombre | Tipo | Teléfono Fijo |
                    // Since there is a leading empty string, index 3 is Login, index 4 is Nombre, index 5 is Tipo
                    const login = cells.length > 3 ? cells[3] : '';
                    const nombre = cells.length > 4 ? cells[4] : '';
                    const tipo = cells.length > 5 ? cells[5] : '';
                    const rawRow = r.innerText.trim();
                    return { login, nombre, tipo, rawRow, cells };
                }).filter(u => u.nombre !== '' && !u.nombre.includes('Nombre') && u.cells.length > 2);
            });
            console.log(`Scraped ${eventos.length} potential events, ${pedidos.length} potential orders, and ${usuarios.length} users.`);
            return {
                success: true,
                data: {
                    eventos: eventos,
                    pedidos: pedidos,
                    usuarios: usuarios,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            console.error('Scraping failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
        finally {
            if (browser)
                yield browser.close();
        }
    });
}
