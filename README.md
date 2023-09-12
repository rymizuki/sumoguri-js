# Sumoguri

A wrapper for puppeteer to explore complex websites.

## Installation

```
npm install sumoguri
```

## Usage

```ts
import { Sumoguri, BrowserTaskFunction } from 'sumoguri'

const sumoguri = new Sumoguri({
  origin: 'http://example.com/',
  puppeteer: {
    headless: false
  }
})

const fetchItems: BrowserTaskFunction<{
  items: string[]
}> = async (browser, { artifact }) => {
  artifact.items = []

  await browser.move('/example', async (page) => {
    await page.action('.list-item', (element) => {
      artifact.items.push(element.text())
    })
  })
}

const main = async () => {
  const { items } = await sumoguri.run(fetchItems)
  console.log('items', items)
}
```
