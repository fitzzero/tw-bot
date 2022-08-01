import { RowData } from '../sheet/sheetData'
import { logger } from '../utility/logger'
import { syncPlayers } from './playerSync'
import { syncTribes } from './tribeSync'
import { syncVillages } from './villageSync'

let inProgress = false

export const syncTwInProgress = () => inProgress

export const syncTw = async (world: RowData) => {
  inProgress = true
  logger({ prefix: 'start', message: `TW: Starting ${world} sync` })
  await syncTribes(world)
  await syncPlayers(world)
  await syncVillages(world)
  inProgress = false
  logger({ prefix: 'success', message: `TW: Sync completed` })
}
