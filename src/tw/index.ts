import fetch from 'cross-fetch'
import { VillageModel } from '../db/village'
import { updateOrCreateWorld } from '../db/world'
import { VillageHistoric } from '../types/village'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const syncWorld = async (worldId: number): Promise<void> => {
  const world = await updateOrCreateWorld(worldId)
  if (!world) {
    logger({ prefix: 'alert', message: 'Database: Failed to load world' })
    return
  }
  if (world.inSync) {
    logger({ prefix: 'alert', message: 'TW: Updated recently, skipping sync' })
    return
  }
  loadVillages(world)
  logger({ prefix: 'success', message: `TW: Finished world ${world._id} sync` })
}

const loadVillages = async (world: World): Promise<void> => {
  try {
    const response = await fetch(
      `https://us${world._id}.tribalwars.us/map/village.txt`
    )
    if (response.status >= 400) {
      throw new Error(`TW Server: ${response.status}`)
    }
    const villages = parseCsv(await response.text())
    if (!villages || villages.length == 0) {
      logger({
        prefix: 'alert',
        message: `TW: Error loading world ${world._id} villages`,
      })
      return
    }
    logger({
      prefix: 'success',
      message: `TW: Loading ${villages?.length} villages...`,
    })

    await Promise.all(
      villages.map(async (data: string[7]) => {
        const villageData: VillageHistoric = {
          _id: parseInt(data[0]),
          name: data[1],
          x: parseInt(data[2]),
          y: parseInt(data[3]),
          player: parseInt(data[4]),
          points: parseInt(data[5]),
          rank: parseInt(data[6]),
          lastSync: world.lastSync,
        }
        if (!villageData || !villageData._id) {
          return
        }

        const index = world.villages.findIndex(
          village => village._id === villageData._id
        )

        if (index > 0) {
          world.villages[index].name = villageData.name
          world.villages[index].x = villageData.x
          world.villages[index].y = villageData.y
          world.villages[index].player = villageData.player
          world.villages[index].rank = villageData.rank
          world.villages[index].lastSync = villageData.lastSync
          world.villages[index].history.unshift(villageData)
        } else {
          const newVillage = new VillageModel(villageData)
          world.villages.push(newVillage)
        }
      })
    )

    world.save()
    logger({
      prefix: 'success',
      message: `TW: Synced ${villages?.length} villages for world ${world._id}`,
    })
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
  }
}
