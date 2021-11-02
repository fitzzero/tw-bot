import { PromiseFn } from '../types/methods'
import { logger } from './logger'

interface TryCatch {
  functionToTry: () => void
}

export const tryCatch: PromiseFn<TryCatch, void> = async ({
  functionToTry,
}) => {
  try {
    functionToTry()
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
  }
}
