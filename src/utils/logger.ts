import { LoggerInterface } from '../interfaces'
import { format as dateTimeFormat } from 'date-fns'

type LogType = 'error' | 'warn' | 'info' | 'debug'
type LoggerOptions = {
  tags?: (string | undefined | null)[]
  time?: boolean
}

export class Logger implements LoggerInterface {
  constructor(private defaults: LoggerOptions = {}) {}

  error(...args: unknown[]) {
    this.log('error', ...args)
  }

  warn(...args: unknown[]) {
    this.log('warn', ...args)
  }

  info(...args: unknown[]) {
    this.log('info', ...args)
  }

  debug(...args: unknown[]) {
    this.log('debug', ...args)
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private log(type: LogType, ...args: any[]) {
    const tags = Array.isArray(args[0]) ? (args.shift() as string[]) : []
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
    const message = args.shift()
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
    const contents = args.shift()
    const options: LoggerOptions = Object.assign({}, this.defaults, {
      tags: [],
      time: process.env.NODE_ENV !== 'production'
    })

    if (options.tags) {
      const default_tags = options.tags.filter((tag) => !!tag)
      tags.unshift(...default_tags)
    }
    if (type === 'debug' && process.env.NODE_ENV === 'production') {
      return
    }
    const time = options.time
      ? `[${dateTimeFormat(new Date(), 'MM-dd HH:mm:ss')}]`
      : ''

    // TODO: error/warnはstderrにしたい
    console.log('%j', {
      time,
      message: `[${type}]${tags.map((tag) => `[${tag}]`).join('')} ${message}`,
      // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
      contents
    })
  }
}

export const logger = new Logger()
