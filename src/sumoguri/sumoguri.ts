import puppeteer, { Page, PuppeteerLaunchOptions } from 'puppeteer'
import {
  AbstractArtifact,
  BrowserTaskFunction,
  SumoguriInterface,
  SumoguriRunOptions
} from '../interfaces'
import { Logger } from '../utils/logger'
import { ScreenShot } from '../utils/screenshot'
import { Browser } from './browser'

export class Sumoguri implements SumoguriInterface {
  private defaults: SumoguriRunOptions

  constructor(options: SumoguriRunOptions = {}) {
    this.defaults = options
  }

  async run<Artifact = AbstractArtifact>(
    task: BrowserTaskFunction<Artifact>,
    args: SumoguriRunOptions = {}
  ): Promise<Artifact> {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const artifact: any = {}
    const options = Object.assign(
      {
        puppeteer: { headless: 'new' }
      },
      this.defaults,
      args
    )

    const logger = new Logger({
      tags: ['scraper', options.pid],
      level: options.logLevel
    })
    await this.runOnScraper(options.puppeteer, async (scraper) => {
      const { screenshot_dirname, screenshot_prefix } = options
      const screenshot = new ScreenShot(scraper, {
        screenshot_dirname,
        screenshot_prefix
      })
      logger.debug('start scraping')

      const browser = new Browser({
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
        /* istanbul ignore next */
        const message = error instanceof Error ? error.message : `${error}`
        logger.error(message, {
          href: await scraper.evaluate('location.href')
        })
        await screenshot.save('error')
        throw error
      }
    })
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
    return artifact
  }

  private async runOnScraper(
    options: PuppeteerLaunchOptions,
    task: (page: Page) => Promise<void>
  ) {
    // setup browser
    const browser = await puppeteer.launch(options)

    // setup page
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Mobile Safari/537.36'
    )
    await page.setViewport({ width: 1280, height: 960 })

    try {
      await task(page)
    } finally {
      await browser.close()
    }
  }
}
