import { connectDb } from '../db/connect'
import { updateOrCreateWorld } from '../db/world'
import { logger } from '../utility/logger'
import { loadPlayers } from './player'
import { loadTribes } from './tribe'
import { loadVillages } from './village'

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
  loadPlayers(world)
  loadVillages(world)
  loadTribes(world)
}
