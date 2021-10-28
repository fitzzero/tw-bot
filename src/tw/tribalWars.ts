import { LoopFn } from '../loop'
import { logger } from '../utility/logger'
import { syncPlayers } from './player'
import { syncTribes } from './tribe'
import { syncVillages } from './village'

export const syncTw: LoopFn = async ({ world }) => {
  logger({ prefix: 'start', message: `TW: Starting ${world.name} sync` })
  syncPlayers({ world })
  syncVillages({ world })
  syncTribes({ world })
}
