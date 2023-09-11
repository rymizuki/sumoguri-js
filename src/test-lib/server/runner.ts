import { ChildProcess, fork } from 'child_process'
import { join } from 'path'

export type ServerOptions = {
  serverPath?: string
}

export class Server {
  private options: ServerOptions
  private process: ChildProcess | null = null
  private server: {
    port: number
    host: string
  } | null = null

  constructor(options: ServerOptions = {}) {
    this.options = options
  }

  get uri() {
    return `http://${this.server.host}:${this.server.port}`
  }

  async listen(port = 0, host?: string): Promise<void> {
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
      this.process.on('message', (message) => {
        // eslint-disable-next-line
        const { payload } = JSON.parse(message.toString()) as any
        // eslint-disable-next-line
        const { port, host } = payload as { host: string; port: number }
        this.server = { port, host }
        resolve(undefined)
      })
    })
  }

  async close(): Promise<void> {
    if (!this.process) {
      throw new Error('Server is not started.')
    }
    return new Promise((resolve) => {
      this.process.on('close', () => {
        resolve(undefined)
      })
      this.process.kill('SIGHUP')
      this.process = null
    })
  }
}

export function createServer(options?: ServerOptions) {
  return new Server(options)
}
