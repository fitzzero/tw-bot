import { connection } from 'mongoose'
import { startDiscord } from '../discord/connect'
import { logger } from '../utility/logger'
// import { villageMigration } from './migrations'

export const DatabaseEvents = (): void => {
  connection.on('open', () => {
    logger({ prefix: 'success', message: 'Database: Connected' })
    startDiscord()
    //villageMigration()
  })
  connection.on('error', err => {
    logger({ prefix: 'success', message: `Database:\n ${err}` })
  })
}
