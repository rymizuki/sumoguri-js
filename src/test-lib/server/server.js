const connect = require('connect')
const http = require('http')

class Server {
  constructor(createServer) {
    const app = connect()
    createServer(app)
    this.server = http.createServer(app)
  }

  async listen(port, host = undefined) {
    return await new Promise((resolve) => {
      this.server.listen(port, host, () => {
        const addr = this.server.address()
        resolve({ port: addr.port, host: addr.host || 'localhost' })
      })
    })
  }
}

exports.createServer = (fn) => {
  const app = new Server(fn)

  process.on('message', async (message) => {
    const { type, payload } = JSON.parse(message)
    if (type === 'listen') {
      const { port, host } = await app.listen(payload.port)

      process.send(
        JSON.stringify({
          type: 'listen',
          payload: { port, host }
        }),
        (error) => (error ? console.error(error) : null)
      )
    }
  })
}
