import { join } from 'path'
import { createRunner, createServer } from '../test-lib'
import { Sumoguri } from './sumoguri'

const runner = createRunner<{
  instance: Sumoguri
}>()
const server = createServer({
  serverPath: join(process.cwd(), 'src/test/server.js')
})

describe('Page', () => {
  afterEach(() => {
    runner.reset()
  })

  beforeEach(async () => {
    await server.listen()
  })
  afterEach(async () => {
    await server.close()
  })

  beforeEach(() => {
    runner.variable(
      'instance',
      new Sumoguri({
        origin: server.uri
      })
    )
  })

  describe('action', () => {
    const action = (path: string, selector: string) => {
      return async () => {
        const instance = runner.variable('instance')
        const { items } = await instance.run<{ items: string[] }>(
          async (browser, { artifact }) => {
            artifact.items = []

            await browser.move(path, async (page) => {
              await page.action(selector, (element) => {
                artifact.items.push(element.text())
              })
            })
          }
        )
        runner.variable('items', items)
      }
    }

    describe('single element', () => {
      beforeEach(action('/example', 'h1'))
      it('should be 1 element found', () => {
        expect(runner.variable('items')).toStrictEqual(['Example Page'])
      })
    })

    describe('multiple element', () => {
      beforeEach(action('/example', '.list-item'))
      it('should be multiple elements found', () => {
        expect(runner.variable('items')).toStrictEqual([
          'item 1',
          'item 2',
          'item 3'
        ])
      })
    })

    describe('undefined element', () => {
      beforeEach(action('/example', '.not-exists-element'))
      it('should be 0 elements found', () => {
        expect(runner.variable('items')).toStrictEqual([])
      })
    })
  })

  describe('getLocationPath', () => {
    beforeEach(async () => {
      const instance = runner.variable('instance')
      const { href } = await instance.run<{ href: string }>(
        async (browser, { artifact }) => {
          await browser.move('/example?page=1#description', async (page) => {
            const href = await page.getLocationPath()
            artifact.href = href
          })
        }
      )
      runner.variable('href', href)
    })
    it('should be current uri', () => {
      expect(runner.variable('href')).toEqual(
        `${server.uri}/example?page=1#description`
      )
    })
  })

  describe('getLocationPathFragment', () => {
    const matcher = (path: string, regexp: RegExp) => {
      return async () => {
        const instance = runner.variable('instance')
        const { fragment } = await instance.run<{ fragment: string | null }>(
          async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              const fragment = await page.getLocationPathFragment(regexp)
              artifact.fragment = fragment
            })
          }
        )
        runner.variable('fragment', fragment)
      }
    }

    describe('on match', () => {
      beforeEach(matcher('/example?page=1', /\?page=([0-9]+)/))
      it('should be got fragment', () => {
        expect(runner.variable('fragment')).toEqual('1')
      })
    })
    describe('on un-match', () => {
      beforeEach(matcher('/example?page=1', /\?page=([a-z]+)/))
      it('should be got fragment', () => {
        expect(runner.variable('fragment')).toEqual(null)
      })
    })
  })

  describe('wait', () => {
    describe('on selector', () => {
      it(
        'should be wait for display element',
        async () => {
          const instance = runner.variable('instance')
          await instance.run(async (browser) => {
            await browser.move('/example', async (page) => {
              await page.wait('.lazy-element')
              await page.action('.lazy-element', (element) => {
                expect(element.text()).toEqual('lazy element')
              })
            })
          })
        },
        10 * 1000
      )
    })
    describe('on time', () => {
      it(
        'should be wait for timeout',
        async () => {
          const instance = runner.variable('instance')
          await instance.run(async (browser) => {
            await browser.move('/example', async (page) => {
              // 現在時刻を記録（秒）
              const past = Math.floor(new Date().getTime() / 1000)
              // 5秒待つ
              await page.wait(5 * 1000)
              // 現在時刻を記録（秒）
              const now = Math.floor(new Date().getTime() / 1000)
              // past と prevの差が5秒
              expect(now - past).toBe(5)
            })
          })
        },
        10 * 1000
      )
    })
  })
  describe('isMatchLocation', () => {
    const matcher = (path: string, regexp: RegExp) => {
      return async () => {
        const instance = runner.variable('instance')
        const { matched } = await instance.run<{ matched: boolean }>(
          async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              const matched = await page.isMatchLocation(regexp)
              artifact.matched = matched
            })
          }
        )
        runner.variable('matched', matched)
      }
    }
    describe('on match', () => {
      beforeEach(matcher('/example?page=1#description', /page=([0-1]+)/))
      it('should be true', () => {
        expect(runner.variable('matched')).toBeTruthy()
      })
    })
    describe('on un-match', () => {
      beforeEach(matcher('/example?page=1#description', /page=([a-z]+)/))
      it('should be true', () => {
        expect(runner.variable('matched')).toBeFalsy()
      })
    })
  })

  describe('hasElement', () => {
    const matcher = (path: string, selector: string) => {
      return async () => {
        const instance = runner.variable('instance')
        const { matched } = await instance.run<{ matched: boolean }>(
          async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              const matched = await page.hasElement(selector)
              artifact.matched = matched
            })
          }
        )
        runner.variable('matched', matched)
      }
    }

    describe('on exists', () => {
      beforeEach(matcher('/example', '.list'))
      it('should be true', () => {
        expect(runner.variable('matched')).toBeTruthy()
      })
    })
    describe('on not exists', () => {
      beforeEach(matcher('/example', '.not-exists-element'))
      it('should be false', () => {
        expect(runner.variable('matched')).toBeFalsy()
      })
    })
  })
})
