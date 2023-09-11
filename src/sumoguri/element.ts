import { AnyNode, Cheerio, CheerioAPI, load } from 'cheerio'
import { ElementInterface, SumoguriContext } from '../interfaces'

export class ScraperElement implements ElementInterface {
  private contents: string
  private context: SumoguriContext
  private scraper: SumoguriContext['scraper']
  public source: string
  public logger: SumoguriContext['logger']
  private $: CheerioAPI

  constructor(source: string, contents: string, context: SumoguriContext) {
    this.source = source
    this.contents = contents
    this.context = context
    this.scraper = this.context.scraper
    this.logger = this.context.logger

    this.$ = load(this.contents)
  }

  async input(name: string, value: string): Promise<void> {
    const target = `${this.source} input[name=${name}]`
    await this.scraper.waitForSelector(target)
    await this.scraper.type(target, value)
    this.logger.debug(['element', target], 'input done')
  }

  async click(selector?: string | undefined): Promise<void> {
    const target = selector ? `${this.source} ${selector}` : this.source
    await this.scraper.click(target)
    this.logger.debug(['element', target], 'click done')
  }

  find(selector: string): Cheerio<AnyNode> {
    return this.$(selector)
  }

  text() {
    return this.find(':root').text()
  }
}
