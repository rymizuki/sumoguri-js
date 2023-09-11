const connect = require('connect')

class Server {
  constructor(createServer) {
    this.app = connect()
    createServer(this.app)
  }

  async listen(port, host) {
    await new Promise((resolve) => {
      this.app.listen(port, host, () => {
        resolve(undefined)
      })
    })
    if (process.send) {
      process.send(
        JSON.stringify({
          type: 'listen',
          payload: { port, host }
        }),
        (error) => (error ? console.error(error) : null)
      )
    }
  }

  close() {}
}

exports.createServer = (fn) => {
  const app = new Server(fn)

  process.on('message', (message) => {
    const { type, payload } = JSON.parse(message)
    if (type === 'listen') {
      app.listen(payload.port)
    }
  })
}
