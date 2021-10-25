import fetch from 'cross-fetch'
import { updateOrCreateVillage } from '../db/village'
import { addVillageHistory } from '../db/villageHistory'
import { LoopFn } from '../loop'
import { VillageData } from '../types/village'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const syncVillages: LoopFn = async ({ world }) => {
  try {
    const villages = await fetchVillages(world)

    await Promise.all(
      villages.map(async data => {
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
        if (!world.inSync) {
          await addVillageHistory(villageData)
        }
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

const fetchVillages = async (world: World): Promise<string[][]> => {
  let api = `https://us${world._id}.tribalwars.us/map/village.txt`
  if (world.testData) {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/village.txt'
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const villages = parseCsv(await response.text())
  if (!villages || villages.length == 0) {
    throw new Error(`TW: Error loading world ${world._id} villages`)
  }
  logger({
    prefix: 'success',
    message: `TW: Loading ${villages?.length} villages...`,
  })

  return villages
}
