import { syncWorld } from './tw'
import { logger } from './utility/logger'

export const startLoop = async () => {
  logger({ prefix: 'success', message: 'Loop: Started' })
  syncWorld(55)
}
