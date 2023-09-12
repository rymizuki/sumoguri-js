import { ChildProcess, Serializable, fork } from 'child_process'
import { join } from 'path'
import { EventEmitter } from 'stream'

type RequestRecord = {
  method: string
  path: string
  body: unknown
}

export type ServerOptions = {
  serverPath?: string
}

export class Server extends EventEmitter {
  private options: ServerOptions
  private process: ChildProcess | null = null
  private server: {
    port: number
    host: string
  } | null = null
  private requestLog: RequestRecord[] = []

  constructor(options: ServerOptions = {}) {
    super()
    this.options = options
  }

  get uri() {
    return `http://${this.server.host}:${this.server.port}`
  }

  async listen(
    port = 0,
    host?: string
  ): Promise<{ port: number; host: string }> {
    const source = this.options.serverPath || join(__dirname, './server.js')

    this.process = fork(source)
    this.process.on('message', (message) => this.onMessage(message))

    this.process.send(
      JSON.stringify({
        type: 'listen',
        payload: { port, host }
      }),
      (error) => {
        if (error) console.error(error)
      }
    )

    return await new Promise((resolve) => {
      this.once('listen', () => {
        resolve({ port: this.server.port, host: this.server.host })
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
      this.clearRequestLog()
    })
  }

  getLastRequest() {
    return this.requestLog[this.requestLog.length - 1]
  }

  match<T = unknown>(method: string, path: string) {
    const request = ([] as RequestRecord[])
      .concat(this.requestLog)
      .reverse()
      .find((req) => req.method === method && req.path === path)
    if (!request) {
      return null
    }
    return {
      method: request.method,
      path: request.path,
      body: request.body as T
    }
  }

  clearRequestLog() {
    this.requestLog = []
  }

  private onMessage(message: Serializable) {
    if (typeof message !== 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`"${message as any}" can not be parse`)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { type, payload } = JSON.parse(message)
    switch (type) {
      case 'listen': {
        const { port, host } = payload as { host: string; port: number }
        this.server = { port, host }
        this.emit('listen')
        break
      }
      case 'request': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { path, method, body } = payload as {
          path: string
          method: string
          body: unknown
        }
        this.requestLog.push({ path, method, body })
        this.emit('request')
        break
      }
    }
  }
}

export function createServer(options?: ServerOptions) {
  return new Server(options)
}
