import { connection } from 'mongoose'
import { logger } from '../utility/logger'
import { initStatsConfig } from './village/villageStats'
// import { villageMigration } from './migrations'

export const DatabaseEvents = (): void => {
  connection.on('open', () => {
    logger({ prefix: 'success', message: 'Database: Connected' })
    initStatsConfig()
    //villageMigration()
  })
  connection.on('error', err => {
    logger({ prefix: 'success', message: `Database:\n ${err}` })
  })
}
