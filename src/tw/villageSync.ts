import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logAlert, logger } from '../utility/logger'
import { VillageData, villages } from '../sheet/villages'
import { worldPath } from './world'

export const syncVillages = async (world: string) => {
  await villages.loadRows()
  const villageData = await fetchVillages(world)

  if (!villageData) {
    logAlert('Data issue, skipping Tribe sync', 'TW')
    return
  }

  for (const data of villageData) {
    if (data[0] === '' || data[0] === null) break
    const x = parseInt(data[2])
    const y = parseInt(data[3])

    const villageData: VillageData = {
      id: data[0],
      name: decodeURIComponent(data[1]).replaceAll('+', ' '),
      x: data[2],
      y: data[3],
      k: `${Math.floor(y / 100) * 10 + Math.floor(x / 100)}`,
      playerId: data[4],
      points: data[5],
      rank: data[6] || '0',
    }
    if (villageData?.id) {
      await villages.auditAndUpdate(villageData)
    }
  }
  logger({
    prefix: 'success',
    message: `TW: Villages synced`,
  })
}

const fetchVillages = async (
  world: string
): Promise<string[][] | undefined> => {
  let api = `${worldPath(world)}map/village.txt`
  let villages: string[][] = []
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/village.txt'
  }
  try {
    const response = await fetch(api)
    if (response.status >= 400) {
      throw new Error(`TW Server ${response.status}`)
    }
    villages = parseCsv(await response.text())
    if (!villages || villages.length == 0) {
      throw new Error(`Error loading world ${world} villages`)
    }
  } catch (err) {
    logAlert('TW')
    return
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${villages?.length - 1} villages...`,
  })

  return villages
}
