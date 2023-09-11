import { join } from 'path'
import { createRunner, createServer } from '../test-lib'
import { Sumoguri } from './sumoguri'
import { BrowserTaskFunction, SumoguriRunOptions } from '../interfaces'

const runner = createRunner<{
  instance: Sumoguri
  origin: string
  options: SumoguriRunOptions
}>()

const server = createServer({
  serverPath: join(process.cwd(), 'src/test/server.js')
})

describe('Browser', () => {
  beforeEach(() => {
    runner.reset()
  })
  beforeEach(async () => {
    await server.listen()
    runner.variable('origin', server.uri)
  })
  afterEach(async () => {
    await server.close()
  })

  beforeEach(() => {
    runner.variable(
      'instance',
      new Sumoguri({
        origin: runner.variable('origin')
      })
    )
  })

  describe('move', () => {
    it('should be open specified url', async () => {
      const instance = runner.variable('instance')
      await instance.run(async (browser) => {
        await browser.move('/example', async (page) => {
          const uri = await page.getLocationPath()
          expect(uri).toBe(`${runner.variable('origin')}/example`)
        })
      })
    })
  })

  describe('exec', () => {
    it('should be call subtask with artifacts', async () => {
      const subtask: BrowserTaskFunction<{ messages: string[] }> = async (
        browser,
        { artifact }
      ) => {
        await browser.move('/example', async () => {
          artifact.messages.push('message 2')
          await Promise.resolve()
        })
      }

      const instance = runner.variable('instance')
      const results = await instance.run<{ messages: string[] }>(
        async (browser, context) => {
          context.artifact.messages = []
          context.artifact.messages.push('message 1')
          await browser.exec(subtask, context)
          context.artifact.messages.push('message 3')
        }
      )

      expect(results).toStrictEqual({
        messages: ['message 1', 'message 2', 'message 3']
      })
    })
  })

  describe('goBack', () => {
    it(
      'should be back previous page',
      async () => {
        const instance = runner.variable('instance')
        const task: BrowserTaskFunction<{ history: string[] }> = async (
          browser,
          { artifact }
        ) => {
          artifact.history = []
          await browser.move('/example?page=1', async (page) => {
            artifact.history.push(await page.getLocationPath())

            await page.action('.button-next', async (element) => {
              await element.click()
              artifact.history.push(await page.getLocationPath())
            })

            await browser.goBack()
            artifact.history.push(await page.getLocationPath())
          })
        }
        const { history } = await instance.run(task, {
          /* XXX: "Puppeteer old Headless deprecation warning" が出るが、
                  { headless: 'new' } だと goBackでtimeoutしてしまう...  */
          puppeteer: { headless: true }
        })
        expect(history).toStrictEqual([
          `${runner.variable('origin')}/example?page=1`,
          `${runner.variable('origin')}/example?page=2`,
          `${runner.variable('origin')}/example?page=1`
        ])
      },
      40 * 1000
    )
  })

  describe('close', () => {
    it('should be close session, could not continue task', async () => {
      const instance = runner.variable('instance')
      await instance.run(async (browser) => {
        await browser.close()

        await expect(async () => {
          await browser.move('/example', async () => {})
        }).rejects.toThrow(/Session closed./)
      })
    })
  })
})
