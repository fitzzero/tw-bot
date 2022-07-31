import { logger } from '../utility/logger'
import { syncPlayers } from './playerSync'
import { syncTribes } from './tribeSync'
import { syncVillages } from './villageSync'

export const syncTw = async (world: string) => {
  logger({ prefix: 'start', message: `TW: Starting ${world} sync` })
  //await syncTribes({ world })
  await syncPlayers(world)
  //await syncVillages({ world })
}
