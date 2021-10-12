import { syncWorld } from './tw/world'
import { logger } from './utility/logger'

export const startLoop = (): void => {
  logger({ prefix: 'success', message: 'Loop: Started' })
  syncWorld(55)
}
