import { join } from 'path'
import { createRunner, createServer } from '../test-lib'
import { Sumoguri } from './sumoguri'

const server = createServer({
  serverPath: join(process.cwd(), 'src/test/server.js')
})

const runner = createRunner<{
  instance: Sumoguri
}>()

describe('Sumoguri', () => {
  beforeEach(() => {
    runner.reset()
  })

  describe('new Sumoguri()', () => {
    it('should be return instance', () => {
      const instance = new Sumoguri()
      expect(instance).toBeInstanceOf(Sumoguri)
    })
  })
  describe('run', () => {
    beforeEach(() => {
      runner.variable('instance', new Sumoguri())
    })

    describe('on success case', () => {
      beforeEach(async () => {
        await server.listen()
      })
      afterEach(() => {
        server.close()
      })
      it('should be return artifact', async () => {
        const instance = runner.variable('instance')
        const artifact = await instance.run<{
          title: string
          message: string
          items: string[]
        }>(
          async (browser, { artifact }) => {
            await browser.move('/example', async (page) => {
              await page.action('h1', (element) => {
                artifact.title = element.text()
              })
              await page.action('.message', (element) => {
                artifact.message = element.text()
              })

              artifact.items = []
              await page.action('.list-item', (element) => {
                artifact.items.push(element.text())
              })
            })
          },
          {
            origin: 'http://localhost:8080'
          }
        )
        expect(artifact).toStrictEqual({
          title: 'Example Page',
          message: 'hello world',
          items: ['item 1', 'item 2', 'item 3']
        })
      })
    })
    describe('on exception case', () => {
      it('should caught error instance', async () => {
        const instance = runner.variable('instance')
        await expect(async () => {
          await instance.run(
            async (browser) => {
              await browser.move('/page-not-exists', async () => {})
            },
            {
              origin: 'http://localhost:8080'
            }
          )
        }).rejects.toThrowError(
          'net::ERR_CONNECTION_REFUSED at http:/localhost:8080/page-not-exists'
        )
      })
    })
  })
})
