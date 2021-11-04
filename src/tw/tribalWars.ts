import { LoopFn } from '../loop'
import { logger } from '../utility/logger'
import { syncPlayers } from './playerSync'
import { syncTribes } from './tribeSync'
import { syncVillages } from './villageSync'

export const syncTw: LoopFn = async ({ world }) => {
  logger({ prefix: 'start', message: `TW: Starting ${world.name} sync` })
  await syncTribes({ world })
  await syncPlayers({ world })
  await syncVillages({ world })
}
