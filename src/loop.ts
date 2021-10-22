import { syncWorld } from './tw/world'
import { logger } from './utility/logger'

export const startLoop = (): void => {
  loop()
  setInterval(function () {
    loop()
  }, 60 * 60 * 1000) // 60 * 60 * 1000 milsec
}

const loop = (): void => {
  logger({ prefix: 'success', message: 'Loop: Starting Update' })
  syncWorld(1)
}
