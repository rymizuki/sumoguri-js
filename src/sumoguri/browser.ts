import { join as pathJoin } from 'path'
import {
  AbstractArtifact,
  BrowserInterface,
  BrowserTaskContext,
  BrowserTaskFunction,
  PageInterface,
  SumoguriContext
} from '../interfaces'
import { ScraperPage } from './page'

export class ScraperBrowser<Artifact = AbstractArtifact>
  implements BrowserInterface<Artifact>
{
  private context: SumoguriContext
  private scraper: SumoguriContext['scraper']
  private logger: SumoguriContext['logger']
  private timeout = 1 * 1000

  constructor(context: SumoguriContext) {
    this.context = context
    this.scraper = context.scraper
    this.logger = context.logger
  }

  async exec(
    task: BrowserTaskFunction<Artifact>,
    context: BrowserTaskContext<Artifact>
  ): Promise<void> {
    this.logger.debug(['browser'], 'subtask execution start', {
      artifact: context.artifact
    })
    await task(this, context)
    this.logger.debug(['browser'], 'subtask execution end', {
      artifact: context.artifact
    })
  }

  async move(
    path: string,
    onMoved: (page: PageInterface) => Promise<void>
  ): Promise<void> {
    const uri = pathJoin(this.context.options.origin || '', path)
    this.logger.debug(['browser'], 'move start', { uri })
    await this.scraper.goto(uri)
    await this.scraper.waitForTimeout(this.timeout)

    const page = new ScraperPage(this.context)
    await onMoved(page)
    this.logger.debug(['browser'], 'move end', { uri })
  }

  async goBack(): Promise<void> {
    this.logger.debug(['browser'], 'goback start', {})
    await this.scraper.goBack()
    await this.scraper.waitForTimeout(this.timeout)
    this.logger.debug(['browser'], 'goback end', {})
  }
}
