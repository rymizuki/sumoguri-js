const { createServer } = require('../test-lib/server/server')

createServer((app) => {
  app.use('/example', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.write(`
<!doctype html>
<html>
<body>

<h1>Example Page</h1>
<p class="message">hello world</p>

<ul class="list">
  <li class="list-item">item 1</li>
  <li class="list-item">item 2</li>
  <li class="list-item">item 3</li>
</ul>

<button class="button">button</button>
</body>
</html>
    `)
    res.end()
  })
})
