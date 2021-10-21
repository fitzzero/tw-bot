import fetch from 'cross-fetch'
import { updateOrCreateVillage } from '../db/village'
import { addVillageHistory } from '../db/villageHistory'
import { VillageData } from '../types/village'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const loadVillages = async (world: World): Promise<void> => {
  let api = `https://us${world._id}.tribalwars.us/map/village.txt`
  if (world.testData) api = './test-data/village.txt'

  try {
    const response = await fetch(api)
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
      villages.map(async (data: string[]) => {
        if (data[0] === '' || data[0] === null) return
        const villageData: VillageData = {
          _id: `${data[2]}|${data[3]}`,
          name: data[1],
          x: parseInt(data[2]),
          y: parseInt(data[3]),
          player: parseInt(data[4]),
          points: parseInt(data[5]),
          rank: parseInt(data[6]) || null,
          lastSync: world.lastSync,
        }
        if (!villageData || !villageData._id) {
          return
        }
        await updateOrCreateVillage(villageData)
        await addVillageHistory(villageData)
      })
    )
    logger({
      prefix: 'success',
      message: `TW: Synced ${villages?.length} villages for world ${world._id}`,
    })
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
  }
}
