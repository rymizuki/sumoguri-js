import { ElementInterface } from '../interfaces'

export type CustomElement = {
  readonly element: ElementInterface
  readonly index: number
}

export function builder<E extends CustomElement>(
  Element: new (element: ElementInterface, index: number) => E,
  action: (element: E, index: number) => Promise<void>
) {
  return async (element: ElementInterface, index: number) => {
    const stuff = new Element(element, index)

    await action(stuff, index)
  }
}
