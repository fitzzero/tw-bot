import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logAlert, logger } from '../utility/logger'
import { VillageData, villages } from '../sheet/villages'
import { worldPath } from './world'
import { conquers } from '../sheet/conquers'

export const syncConquers = async (world: string) => {
  await conquers.loadRows()
  const conquerData = await fetchConquers(world)

  if (!conquerData) {
    logAlert('Data issue, skipping Conquer sync', 'TW')
    return
  }

  for (const data of conquerData) {
    if (data[0] === '' || data[0] === null) continue
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

const fetchConquers = async (
  world: string
): Promise<string[][] | undefined> => {
  let api = `${worldPath(world)}map/conquer.txt`
  let conquers: string[][] = []
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/conquer.txt'
  }
  try {
    const response = await fetch(api)
    if (response.status >= 400) {
      throw new Error(`TW Server ${response.status}`)
    }
    conquers = parseCsv(await response.text())
    if (!conquers || conquers.length == 0) {
      throw new Error(`Error loading world ${world} conquers`)
    }
  } catch (err) {
    logAlert('TW')
    return
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${conquers?.length - 1} conquers...`,
  })

  return conquers
}
