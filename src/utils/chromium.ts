import chromium from '@sparticuz/chromium-min';
import puppeteer, { type Browser } from 'puppeteer';
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';

export async function getPage() {
    let browser: Browser | BrowserCore;
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
        browser = await puppeteer.launch({
            executablePath,
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport
        });
    } else {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    return browser;
}

export async function getScreenshot(html: string, isDev: boolean) {
    const browser = await getPage();
    const page = await browser.newPage();

    try {
        await page.setViewport({ width: 900, height: 1600 });
        await page.setContent(html, { waitUntil: 'load' });
        await page.evaluateHandle('document.fonts.ready');
        const screenshot = await page.screenshot({ type: 'png' });
        return screenshot;
    } finally {
        await browser.close();
    }
}