import puppeteer from 'puppeteer'
import {
  AbstractArtifact,
  BrowserTaskFunction,
  SumoguriInterface,
  SumoguriRunOptions
} from '../interfaces'
import { Logger } from '../utils/logger'
import { ScreenShot } from '../utils/screenshot'
import { ScraperBrowser } from './browser'

export const ScraperIdentity = Symbol.for('Scraper')

export class Sumoguri implements SumoguriInterface {
  constructor() {}

  async run<Artifact = AbstractArtifact>(
    task: BrowserTaskFunction<Artifact>,
    options: SumoguriRunOptions = {}
  ): Promise<Artifact> {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const artifact: any = {}

    const logger = new Logger({ tags: ['scraper', options.pid] })
    const scraper = await this.createScraper()
    const screenshot = new ScreenShot(scraper, options)
    logger.debug('start scraping')

    const browser = new ScraperBrowser({
      scraper,
      logger,
      options,
      screenshot
    })

    try {
      await task(browser, {
        // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
        artifact,
        logger,
        screenshot
      })
      // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
      logger.debug('end scraping', { artifact })
    } catch (error) {
      logger.error(error, {
        href: await scraper.evaluate('location.href')
      })
      await screenshot.save('error')
      throw error
    }

    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
    return artifact
  }

  private async createScraper() {
    // setup browser
    const options = {}
    const browser = await puppeteer.launch(options)

    // setup page
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Mobile Safari/537.36'
    )
    await page.setViewport({ width: 1280, height: 960 })

    return page
  }
}
