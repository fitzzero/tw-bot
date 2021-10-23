import { World } from '../types/world'
import { logger } from '../utility/logger'
import { syncPlayers } from './player'
import { syncTribes } from './tribe'
import { syncVillages } from './village'

export const syncTw = async (world: World): Promise<void> => {
  if (world.inSync) {
    logger({ prefix: 'alert', message: 'TW: Updated recently, skipping sync' })
    return
  }
  syncPlayers(world)
  syncVillages(world)
  syncTribes(world)
}
