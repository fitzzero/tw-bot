import { LoopFn } from '../loop'
import { World } from '../types/world'
import { logger } from '../utility/logger'
import { syncPlayers } from './player'
import { syncTribes } from './tribe'
import { syncVillages } from './village'

export interface TwProps {
  world: World
}

export const syncTw: LoopFn = async ({ world }) => {
  if (world.inSync) {
    logger({
      prefix: 'success',
      message: 'TW: Updated recently, skipping sync',
    })
    return
  }
  syncPlayers({ world })
  syncVillages({ world })
  syncTribes({ world })
}
