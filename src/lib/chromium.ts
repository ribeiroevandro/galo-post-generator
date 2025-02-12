import puppeteer, { Page } from 'puppeteer-core'
import { getOptions } from './chromeOptions'

let _page: Page | null

async function getPage(isDev: boolean): Promise<Page> {
    if (_page) {
        return _page
    }

    const options = await getOptions(isDev)
    const browser = await puppeteer.launch(options)

    _page = await browser.newPage()

    return _page
}

export async function getScreenshot(
    html: string,
    isDev: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    const page = await getPage(isDev)

    await page.setViewport({ width: 900, height: 1600 });
    await page.setContent(html)
    await page.evaluateHandle('document.fonts.ready')

    const file = await page.screenshot({ type: 'png' })

    return file
}