import fetch from 'cross-fetch'
import moment from 'moment'
import { updateOrCreateVillage } from '../db/village'
import { updateOrCreateWorld } from '../db/world'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'
import { withinLastHour } from '../utility/time'

export const syncWorld = async (worldId: number): Promise<void> => {
  const world = await updateOrCreateWorld(worldId)
  if (!world) {
    logger({ prefix: 'alert', message: 'Database: Failed to load world' })
    return
  }
  if (withinLastHour(moment(world.lastSync))) {
    logger({ prefix: 'alert', message: 'TW: Updated recently, skipping sync' })
    return
  }
  loadVillages(world)
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
    logger({
      prefix: 'success',
      message: `TW: Loading ${villages?.length} villages...`,
    })

    villages.forEach((village: string[7]) => {
      updateOrCreateVillage({
        _id: parseInt(village[0]),
        name: village[1],
        x: parseInt(village[2]),
        y: parseInt(village[3]),
        player: parseInt(village[4]),
        points: parseInt(village[5]),
        rank: parseInt(village[6]),
        lastSync: world.lastSync,
      })
    })

    logger({
      prefix: 'success',
      message: `TW: Completed syncing ${villages?.length} villages`,
    })
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
  }
}
