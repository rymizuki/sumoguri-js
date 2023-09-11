import { ScraperElement } from './element'
import { ElementInterface, PageInterface, SumoguriContext } from '../interfaces'

export class ScraperPage implements PageInterface {
  private context: SumoguriContext
  private scraper: SumoguriContext['scraper']
  private logger: SumoguriContext['logger']

  constructor(context: SumoguriContext) {
    this.context = context
    this.scraper = context.scraper
    this.logger = context.logger
  }

  async action(
    selector: string,
    onFound: (element: ElementInterface, index: number) => Promise<void>
  ): Promise<void> {
    this.logger.debug(['page', 'action', selector], 'start')
    const contents = await this.scraper.$$eval(selector, (elements) => {
      return elements.map((element) => element.outerHTML)
    })
    for (let index = 0; index < contents.length; index++) {
      const content = contents[index]
      const element_selector = `${selector}:nth-of-type(${index + 1})`
      const element = new ScraperElement(
        element_selector,
        content,
        this.context
      )

      this.logger.debug(['page', 'action', selector, `${index}`], 'start')
      await onFound(element, index)
      this.logger.debug(['page', 'action', selector, `${index}`], 'end')
    }
    this.logger.debug(['page', 'action', selector], 'end')
  }

  async getLocationPath(): Promise<string> {
    return await this.scraper.evaluate(() => {
      return location.href
    })
  }

  async getLocationPathFragment(regexp: RegExp): Promise<string | null> {
    const path = await this.getLocationPath()
    const matched = path.match(regexp)
    if (!matched) {
      return null
    }
    return matched[1]
  }

  async wait(input: string | number) {
    if (typeof input === 'string') {
      await this.scraper.waitForSelector(input)
      return
    }
    if (typeof input === 'number') {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(undefined)
        }, input)
      )
      return
    }
  }

  async isMatchLocation(regexp: RegExp): Promise<boolean> {
    const href = await this.scraper.evaluate(() => {
      return location.href
    })
    return regexp.test(href)
  }

  async hasElement(selector: string): Promise<boolean> {
    const count = await this.scraper.evaluate(
      `document.querySelectorAll("${selector}").length`
    )
    return 0 < Number(count)
  }
}
