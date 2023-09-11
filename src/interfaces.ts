import { AnyNode, Cheerio } from 'cheerio'
import { Page } from 'puppeteer'

type LoggerLogContents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
export type LoggerInterface = {
  error(message: string, contents?: LoggerLogContents): void
  error(tags: string[], message: string, contents?: LoggerLogContents): void

  warn(message: string, contents?: LoggerLogContents): void
  warn(tags: string[], message: string, contents?: LoggerLogContents): void

  info(message: string, contents?: LoggerLogContents): void
  info(tags: string[], message: string, contents?: LoggerLogContents): void

  debug(message: string, contents?: LoggerLogContents): void
  debug(tags: string[], message: string, contents?: LoggerLogContents): void
}

export type ScreenShotInterface = {
  save(name: string): Promise<void>
}

export type SumoguriContext = {
  scraper: Page
  logger: BrowserTaskLoggerInterface
  screenshot: ScreenShotInterface
  options: {
    origin?: string
    screenshot_prefix?: string
    screenshot_dirname?: string
  }
}

export type SumoguriRunOptions = {
  origin?: string
  pid?: string
  screenshot_prefix?: string
  screenshot_dirname?: string
}

export interface SumoguriInterface {
  run<Artifact = undefined>(
    task: BrowserTaskFunction<Artifact>,
    options?: SumoguriRunOptions
  ): Promise<Artifact>
}

export type BrowserTaskLoggerInterface = LoggerInterface

export type AbstractArtifact =
  | undefined
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [prop: string]: any
    }

export type BrowserTaskContext<Artifact extends AbstractArtifact> = {
  artifact: Artifact
  logger: BrowserTaskLoggerInterface
  screenshot: ScreenShotInterface
}
export type BrowserTaskFunction<Artifact = AbstractArtifact> = (
  browser: BrowserInterface,
  context: BrowserTaskContext<Artifact>
) => Promise<void>

export type BrowserInterface<Artifact = AbstractArtifact> = {
  exec(
    task: BrowserTaskFunction<Artifact>,
    context: BrowserTaskContext<Artifact>
  ): Promise<void>
  move(
    path: string,
    onMoved: (page: PageInterface) => Promise<void>
  ): Promise<void>
  goBack(): Promise<void>
  close(): Promise<void>
}

export interface PageInterface {
  /**
   *
   */
  getLocationPath(): Promise<string>

  /**
   *
   * @param regexp
   */
  getLocationPathFragment(regexp: RegExp): Promise<string | null>

  /**
   * selectorを検索し、発見したら処理を実行する
   * @param selector
   * @param onFound
   */
  action(
    selector: string,
    onFound: (element: ElementInterface, index: number) => Promise<void> | void
  ): Promise<void>

  /**
   * DOMの描画を待つ
   * @param selector
   */
  wait(selector: string): Promise<void>
  /**
   * 指定時間待つ
   * @param timeout
   */
  wait(timeout: number): Promise<void>

  /**
   *
   * @param regexp
   */
  isMatchLocation(regexp: RegExp): Promise<boolean>

  /**
   *
   * @param selector
   */
  hasElement(selector: string): Promise<boolean>
}

export interface ElementInterface {
  source: string
  logger: SumoguriContext['logger']

  /**
   * 指定したnameの要素にvalueを入力する
   * @param name
   * @param value
   */
  input(name: string, value: string): Promise<void>

  /**
   * 指定した要素をクリックする
   * @param selector
   */
  click(selector?: string): Promise<void>

  /**
   * 指定した要素のインスタンスを返す
   * @param selector
   */
  find(selector: string): Cheerio<AnyNode>

  /**
   * 要素のテキストを返す
   */
  text(): string | null
}
