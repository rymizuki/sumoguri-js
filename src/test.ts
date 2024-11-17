import path from 'path'
import { Sumoguri } from '.'
import { BrowserTaskFunction } from './interfaces'

const task: BrowserTaskFunction<{
  articles: { label: string; subject: string; date: string; href: string }[]
}> = async (browser, { artifact }) => {
  await browser.move('/info', async (page) => {
    artifact.articles = []

    await page.wait('.Section')
    await page.action('.List_item', (element) => {
      artifact.articles.push({
        label: element.find('.Calendar_Label').text(),
        subject: element.find('.List_body').text().replace(/ +/g, ''),
        date: element.find('.Date').text(),
        href: element.find('a').attr('href')
      })
    })
  })
}

async function main() {
  const client = new Sumoguri()

  const results = await client.run(task, {
    origin: 'https://www.pokemon-card.com',
    screenshot_dirname: path.join(__dirname, '../', 'dist/screenshots')
  })
  console.log(results)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => console.error(error))
