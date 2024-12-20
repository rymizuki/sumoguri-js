import { Element } from './element'
import {
  ElementConstructor,
  ElementInterface,
  PageActionFunction,
  PageInterface,
  SumoguriContext
} from '../interfaces'
import { wait } from '../utils/wait'

export class Page implements PageInterface {
  private context: SumoguriContext
  private scraper: SumoguriContext['scraper']
  private logger: SumoguriContext['logger']

  constructor(context: SumoguriContext) {
    this.context = context
    this.scraper = context.scraper
    this.logger = context.logger
  }

  async action<E extends ElementInterface = ElementInterface>(
    ...args:
      | [string, PageActionFunction<Element>]
      | [string, ElementConstructor<E>, PageActionFunction<E>]
  ): Promise<void> {
    const selector = args[0]
    const onFound = args[args.length - 1] as PageActionFunction<E | Element>
    const ElementClass = args.length === 3 ? args[1] : Element

    this.logger.debug(['page', 'action', selector], 'start')
    /* istanbul ignore next */
    const contents = await this.scraper.$$eval(selector, (elements) => {
      return elements.map((element) => element.outerHTML)
    })
    for (let index = 0; index < contents.length; index++) {
      const content = contents[index]
      const element_selector = `${selector}:nth-of-type(${index + 1})`
      const element = new ElementClass(element_selector, content, this.context)

      try {
        this.logger.debug(['page', 'action', selector, `${index}`], 'start')
        await onFound(element, index)
      } catch (error) {
        this.logger.error(
          ['page', 'action', selector, `${index}`],
          error instanceof Error ? error.stack : `Error: ${error}`
        )
      } finally {
        this.logger.debug(['page', 'action', selector, `${index}`], 'end')
      }
    }
    this.logger.debug(['page', 'action', selector], 'end')
  }

  async getLocationPath(): Promise<string> {
    /* istanbul ignore next */
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
      await wait(input)
      return
    }
  }

  async isMatchLocation(regexp: RegExp): Promise<boolean> {
    const href = await this.getLocationPath()
    return regexp.test(href)
  }

  async hasElement(selector: string): Promise<boolean> {
    const count = await this.scraper.evaluate(
      `document.querySelectorAll("${selector}").length`
    )
    return 0 < Number(count)
  }

  async close() {
    await this.scraper.close()
  }
}
