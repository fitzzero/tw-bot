import { PromiseFn } from '../types/methods'
import { logger } from './logger'

interface TryCatch {
  tryFn: () => void
  name: string
}

export const tryCatch: PromiseFn<TryCatch, void> = async ({ tryFn, name }) => {
  try {
    tryFn()
  } catch (err) {
    logger({ prefix: 'alert', message: `$${name}: ${err}` })
  }
}
