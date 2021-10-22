import { connectDb } from '../db/connect'
import { updateOrCreateWorld } from '../db/world'
import { logger } from '../utility/logger'
import { syncPlayers } from './player'
import { syncTribes } from './tribe'
import { syncVillages } from './village'

export const syncWorld = async (worldId: number): Promise<void> => {
  await connectDb(worldId)

  const world = await updateOrCreateWorld(worldId)
  if (!world) {
    logger({ prefix: 'alert', message: 'Database: Failed to load world' })
    return
  }
  if (world.inSync) {
    logger({ prefix: 'alert', message: 'TW: Updated recently, skipping sync' })
    return
  }
  syncPlayers(world)
  syncVillages(world)
  syncTribes(world)
}
