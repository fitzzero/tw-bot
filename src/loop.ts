import { activeWorlds } from './config'
import { syncWorld } from './tw/world'
import { logger } from './utility/logger'

export const startLoop = (dev?: boolean): void => {
  const worlds = dev ? [1] : activeWorlds

  loop(worlds)
  setInterval(function () {
    loop(worlds)
  }, 60 * 60 * 1000) // 60 * 60 * 1000 milsec
}

const loop = (worlds: number[]): void => {
  logger({ prefix: 'success', message: 'Loop: Starting Update' })

  worlds.forEach(world => {
    syncWorld(world)
  })
}
