import { ChildProcess, fork } from 'child_process'
import { join } from 'path'

export type ServerOptions = {
  serverPath?: string
}

export class Server {
  private options: ServerOptions
  private process: ChildProcess | null = null

  constructor(options: ServerOptions = {}) {
    this.options = options
  }

  async listen(port = 8080, host?: string) {
    const source = this.options.serverPath || join(__dirname, './server.js')
    this.process = fork(source)
    this.process.send(
      JSON.stringify({
        type: 'listen',
        payload: { port, host }
      }),
      (error) => {
        if (error) console.error(error)
      }
    )
    return new Promise((resolve) => {
      this.process.on('message', () => {
        console.log(`server wake-up on http://${host || 'localhost'}:${port}`)
        resolve(undefined)
      })
    })
  }

  close() {
    if (!this.process) {
      throw new Error('Server is not started.')
    }
    this.process.kill()
    this.process = null
  }
}
