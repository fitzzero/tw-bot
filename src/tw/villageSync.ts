import fetch from 'cross-fetch'
import { LoopFn } from '../loop'
import { VillageData } from '../@types/village'
import { World } from '../@types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'
import { withinLastDay } from '../utility/time'

export const syncVillages: LoopFn = async ({ world }) => {
  try {
    const villageDataCsv = await fetchVillages(world)
    const newVillageData: VillageData[] = []

    await Promise.all(
      villageDataCsv.map(async data => {
        if (data[0] === '' || data[0] === null) return
        const x = parseInt(data[2])
        const y = parseInt(data[3])

        // const villageData: VillageData = {
        //   _id: `${data[2]}|${data[3]}`,
        //   name: data[1],
        //   number: parseInt(data[0]),
        //   x,
        //   y,
        //   k: Math.floor(y / 100) * 10 + Math.floor(x / 100),
        //   playerId: data[4],
        //   points: parseInt(data[5]),
        //   rank: parseInt(data[6]) || null,
        //   lastSync: world.lastSync,
        // }
        // if (!villageData || !villageData._id) {
        //   return
        // }
        // updateOrCreateVillage(villageData)
        // await addVillageHistory(villageData)
        // newVillageData.push(villageData)
        // return villageData
      })
    )

    // await saveActiveVillages()
    // if (!withinLastDay(world.lastSync)) {
    //   // cleanDeletedVillages({ newVillageData })
    //   return
    // }
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
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
    prefix: 'start',
    message: `TW: Loading ${villages?.length} villages...`,
  })

  return villages
}
