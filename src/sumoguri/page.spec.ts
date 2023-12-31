import { join } from 'path'
import { createServer, createVariables } from '../test-lib'
import { Sumoguri } from './sumoguri'

const vars = createVariables<{
  instance: Sumoguri
  items: string[]
  href: string
  fragment: string
  matched: boolean
}>()
const server = createServer({
  serverPath: join(process.cwd(), 'src/test/server.js')
})

describe('Page', () => {
  afterEach(() => {
    vars.reset()
  })

  beforeEach(async () => {
    await server.listen()
  })
  afterEach(async () => {
    await server.close()
  })

  beforeEach(() => {
    vars.set('instance', new Sumoguri({ origin: server.uri }))
  })

  describe('action', () => {
    const action = (path: string, selector: string) => {
      return async () => {
        const instance = vars.get('instance')
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
        vars.set('items', items)
      }
    }

    describe('single element', () => {
      beforeEach(action('/example', 'h1'))
      it('should be 1 element found', () => {
        expect(vars.get('items')).toStrictEqual(['Example Page'])
      })
    })

    describe('multiple element', () => {
      beforeEach(action('/example', '.list-item'))
      it('should be multiple elements found', () => {
        expect(vars.get('items')).toStrictEqual(['item 1', 'item 2', 'item 3'])
      })
    })

    describe('undefined element', () => {
      beforeEach(action('/example', '.not-exists-element'))
      it('should be 0 elements found', () => {
        expect(vars.get('items')).toStrictEqual([])
      })
    })
  })

  describe('getLocationPath', () => {
    beforeEach(async () => {
      const instance = vars.get('instance')
      const { href } = await instance.run<{ href: string }>(
        async (browser, { artifact }) => {
          await browser.move('/example?page=1#description', async (page) => {
            const href = await page.getLocationPath()
            artifact.href = href
          })
        }
      )
      vars.set('href', href)
    })
    it('should be current uri', () => {
      expect(vars.get('href')).toEqual(
        `${server.uri}/example?page=1#description`
      )
    })
  })

  describe('getLocationPathFragment', () => {
    const matcher = (path: string, regexp: RegExp) => {
      return async () => {
        const instance = vars.get('instance')
        const { fragment } = await instance.run<{ fragment: string | null }>(
          async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              const fragment = await page.getLocationPathFragment(regexp)
              artifact.fragment = fragment
            })
          }
        )
        vars.set('fragment', fragment)
      }
    }

    describe('on match', () => {
      beforeEach(matcher('/example?page=1', /\?page=([0-9]+)/))
      it('should be got fragment', () => {
        expect(vars.get('fragment')).toEqual('1')
      })
    })
    describe('on un-match', () => {
      beforeEach(matcher('/example?page=1', /\?page=([a-z]+)/))
      it('should be got fragment', () => {
        expect(vars.get('fragment')).toEqual(null)
      })
    })
  })

  describe('wait', () => {
    describe('on selector', () => {
      it(
        'should be wait for display element',
        async () => {
          const instance = vars.get('instance')
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
          const instance = vars.get('instance')
          await instance.run(async (browser) => {
            await browser.move('/example', async (page) => {
              // 現在時刻を記録（秒）
              const past = Math.floor(new Date().getTime() / 1000)
              // 5秒待つ
              await page.wait(5)
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
        const instance = vars.get('instance')
        const { matched } = await instance.run<{ matched: boolean }>(
          async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              const matched = await page.isMatchLocation(regexp)
              artifact.matched = matched
            })
          }
        )
        vars.set('matched', matched)
      }
    }
    describe('on match', () => {
      beforeEach(matcher('/example?page=1#description', /page=([0-1]+)/))
      it('should be true', () => {
        expect(vars.get('matched')).toBeTruthy()
      })
    })
    describe('on un-match', () => {
      beforeEach(matcher('/example?page=1#description', /page=([a-z]+)/))
      it('should be true', () => {
        expect(vars.get('matched')).toBeFalsy()
      })
    })
  })

  describe('hasElement', () => {
    const matcher = (path: string, selector: string) => {
      return async () => {
        const instance = vars.get('instance')
        const { matched } = await instance.run<{ matched: boolean }>(
          async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              const matched = await page.hasElement(selector)
              artifact.matched = matched
            })
          }
        )
        vars.set('matched', matched)
      }
    }

    describe('on exists', () => {
      beforeEach(matcher('/example', '.list'))
      it('should be true', () => {
        expect(vars.get('matched')).toBeTruthy()
      })
    })
    describe('on not exists', () => {
      beforeEach(matcher('/example', '.not-exists-element'))
      it('should be false', () => {
        expect(vars.get('matched')).toBeFalsy()
      })
    })
  })

  describe('close', () => {
    it('should be fail call page process', async () => {
      const instance = vars.get('instance')
      await instance.run(async (browser) => {
        await browser.move('/example', async (page) => {
          await page.close()
          await expect(async () => {
            await page.hasElement('body')
          }).rejects.toThrow()
        })
      })
    })
  })
})
