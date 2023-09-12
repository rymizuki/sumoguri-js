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

<a href="?page=2" class="button-next">next</a>

<form method="post">
  <input type="text" name="email">
  <input type="password" name="password">
  <button type="submit">submit</submit>
</form>

<script>
(() => {
  const element = document.createElement('div')
  element.appendChild(document.createTextNode('lazy element'))
  element.className = 'lazy-element'
  setTimeout(() => {
    document.body.appendChild(element)
  }, 5 * 1000)
})()
</script>
</body>
</html>
    `)
    res.end()
  })
})
