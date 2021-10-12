import { connection } from 'mongoose'
import { logger } from '../utility/logger'

export const DatabaseEvents = (): void => {
  connection.on('open', () => {
    logger({ prefix: 'success', message: 'Database: Connected' })
  })
  connection.on('error', err => {
    logger({ prefix: 'success', message: `Database:\n ${err}` })
  })
}
