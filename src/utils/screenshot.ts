import { ScreenShotInterface, SumoguriContext } from '../interfaces'
import { join as pathJoin } from 'path'

export class ScreenShot implements ScreenShotInterface {
  private prefix: string | null
  private dirname: string
  private type: string
  private scraper: SumoguriContext['scraper']

  constructor(
    scraper: SumoguriContext['scraper'],
    options: SumoguriContext['options'],
    type: string = 'png'
  ) {
    this.scraper = scraper
    this.dirname = options.screenshot_dirname || '/tmp/sumoguri/screenshots'
    this.prefix = options.screenshot_prefix || null
    this.type = type
  }

  async save(name: string) {
    if (process.env.NODE_ENV !== 'development') {
      return
    }
    await this.scraper.screenshot({
      path: pathJoin(
        this.dirname,
        `${this.prefix ? this.prefix + '_' : ''}${name}.${this.type}`
      )
    })
  }
}
