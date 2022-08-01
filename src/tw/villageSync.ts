import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'
import { VillageData, villages } from '../sheet/villages'

export const syncVillages = async (world: string) => {
  const villageData = await fetchVillages(world)
  const newVillageData: VillageData[] = []

  for (const data of villageData) {
    if (data[0] === '' || data[0] === null) return
    const x = parseInt(data[2])
    const y = parseInt(data[3])

    const villageData: VillageData = {
      id: data[0],
      name: data[1],
      x,
      y,
      k: Math.floor(y / 100) * 10 + Math.floor(x / 100),
      playerId: data[4],
      points: parseInt(data[5]),
      rank: parseInt(data[6]) || 0,
    }
    if (villageData?.id) {
      await villages.updateOrAdd({ ...villageData })
    }
  }
}

const fetchVillages = async (world: string): Promise<string[][]> => {
  let api = `https://us${world}.tribalwars.us/map/village.txt`
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/village.txt'
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const villages = parseCsv(await response.text())
  if (!villages || villages.length == 0) {
    throw new Error(`TW: Error loading world ${world} villages`)
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${villages?.length} villages...`,
  })

  return villages
}
