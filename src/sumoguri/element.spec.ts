import { join } from 'path'
import { ElementInterface } from '../interfaces'
import { createServer, createVariables } from '../test-lib'
import { Sumoguri } from './sumoguri'

const vars = createVariables<{
  instance: Sumoguri
  value: string | string[]
  element: ReturnType<ElementInterface['find']>
}>()
const server = createServer({
  serverPath: join(process.cwd(), 'src/test/server.js')
})

describe('Element', () => {
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

  describe('click', () => {
    describe('with selector', () => {
      beforeEach(async () => {
        const instance = vars.get('instance')
        await instance.run(async (browser) => {
          await browser.move('/example', async (page) => {
            await page.action('form', async (element) => {
              await element.click('button[type="submit"]')
            })
          })
        })
      })
      it('should be transition is triggered by a click', () => {
        const request = server.getLastRequest()
        expect(request).toStrictEqual({
          method: 'POST',
          path: '/example',
          body: {
            email: '',
            password: ''
          }
        })
      })
    })
    describe('without selector', () => {
      beforeEach(async () => {
        const instance = vars.get('instance')
        await instance.run(async (browser) => {
          await browser.move('/example', async (page) => {
            await page.action('button[type="submit"]', async (element) => {
              await element.click()
            })
          })
        })
      })
      it('should be transition is triggered by a click', () => {
        const request = server.getLastRequest()
        expect(request).toStrictEqual({
          method: 'POST',
          path: '/example',
          body: {
            email: '',
            password: ''
          }
        })
      })
    })
  })

  describe('input', () => {
    const input = (path: string, name: string, input: string) => {
      return async () => {
        const instance = vars.get('instance')
        await instance.run(async (browser) => {
          await browser.move(path, async (page) => {
            await page.action('form', async (element) => {
              await element.input(name, input)
              await element.click('button[type="submit"]')
              await page.wait(0.5 * 1000)
            })
          })
        })
      }
    }
    describe('on input[type=text]', () => {
      beforeEach(input('/example', 'email', 'example@example.com'))
      it('has been entered value', () => {
        const request = server.match<{ email: string }>('POST', '/example')
        expect(request.body.email).toBe('example@example.com')
      })
    })
    describe('on input[type=password]', () => {
      beforeEach(input('/example', 'password', '123abcDEF!@#'))
      it('has been entered value', () => {
        const request = server.match<{ password: string }>('POST', '/example')
        expect(request.body.password).toBe('123abcDEF!@#')
      })
    })
  })

  describe('find', () => {
    const find = (path: string, selector: string) => {
      return async () => {
        const { element } = await vars
          .get('instance')
          .run<{ element: ReturnType<ElementInterface['find']> }>(
            async (browser, { artifact }) => {
              await browser.move(path, async (page) => {
                await page.action('body', (element) => {
                  artifact.element = element.find(selector)
                })
              })
            }
          )
        vars.set('element', element)
      }
    }
    describe('on found element', () => {
      beforeEach(find('/example', 'a[href]'))
      describe('.text()', () => {
        it('should be textNode value', () => {
          expect(vars.get('element').text()).toBe('next')
        })
      })
      describe('.attr(name)', () => {
        it('should be attribute value', () => {
          expect(vars.get('element').attr('href')).toBe('?page=2')
        })
      })
    })
    describe('on not found element', () => {
      beforeEach(find('/example', '.not-exists-element'))
      it('should be empty object', () => {
        expect(vars.get('element').length).toBe(0)
      })
    })
  })

  describe('text', () => {
    const text = (path: string, selector: string) => {
      return async () => {
        const { value } = await vars
          .get('instance')
          .run<{ value: string }>(async (browser, { artifact }) => {
            await browser.move(path, async (page) => {
              await page.action(selector, (element) => {
                artifact.value = element.text()
              })
            })
          })
        vars.set('value', value)
      }
    }
    describe('on found element', () => {
      beforeEach(text('/example', '.message'))
      it('should be text value', () => {
        expect(vars.get('value')).toBe('hello world')
      })
    })
  })
})
