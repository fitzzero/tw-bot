import fetch from 'cross-fetch'
import { TribeData, tribes } from '../sheet/tribes'
import { parseCsv } from '../utility/data'
import { logAlert, logger } from '../utility/logger'
import { worldPath } from './world'

export const syncTribes = async (world: string) => {
  await tribes.loadRows()
  // Data: id, name, tag, members, villages, points, all_points, rank
  const tribeData = await fetchTribes(world)

  // Data: rank, id, kills
  const od = await fetchTribeOd(world, 'all')
  const oda = await fetchTribeOd(world, 'att')
  const odd = await fetchTribeOd(world, 'def')

  if (!tribeData || !od || !oda || !odd) {
    logAlert('Data issue, skipping Tribe sync', 'TW')
    return
  }

  for (const data of tribeData) {
    if (data[0] === '' || data[0] === null) continue
    const tribeId = data[0]
    const tribeOd = od.find(data => data[1] === tribeId)
    const tribeOda = oda.find(data => data[1] === tribeId)
    const tribeOdd = odd.find(data => data[1] === tribeId)

    const tribeData: TribeData = {
      id: data[0],
      name: decodeURIComponent(data[1]).replaceAll('+', ' '),
      tag: decodeURIComponent(data[2]).replaceAll('+', ' '),
      members: data[3],
      villages: data[4],
      points: data[5],
      allPoints: data[6],
      rank: data[7] || '0',
      od: tribeOd ? tribeOd[2] : '0',
      oda: tribeOda ? tribeOda[2] : '0',
      odd: tribeOdd ? tribeOdd[2] : '0',
      tracking: '',
    }
    if (tribeData.id) {
      await tribes.updateOrAdd({ ...tribeData })
    }
  }
  logger({
    prefix: 'success',
    message: `TW: Tribes synced`,
  })
  return
}

export const fetchTribes = async (
  world: string
): Promise<string[][] | undefined> => {
  let api = `${worldPath(world)}map/ally.txt`
  let tribes: string[][] = []
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/ally.txt'
  }
  try {
    const response = await fetch(api)
    if (response.status >= 400) {
      throw new Error(`TW Server ${response.status}`)
    }
    tribes = parseCsv(await response.text())
    if (!tribes || tribes.length == 0) {
      throw new Error(`Error loading world ${world} tribes`)
    }
  } catch (err) {
    logAlert(err, 'TW')
    return
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${tribes?.length - 1} tribes...`,
  })

  return tribes
}

const fetchTribeOd = async (
  world: string,
  type: 'att' | 'def' | 'all'
): Promise<string[][] | undefined> => {
  let api = `${worldPath(world)}map/kill_${type}_tribe.txt`
  let od: string[][] = []
  if (world == 'dev') {
    api = `https://fitzzero.sirv.com/tribalwars/example-data/kill_${type}_tribe.txt`
  }
  try {
    const response = await fetch(api)
    if (response.status >= 400) {
      throw new Error(`TW Server ${response.status}`)
    }
    od = parseCsv(await response.text())
    if (!od || od.length == 0) {
      throw new Error(`Error loading world ${world} opponents defeated tribe`)
    }
  } catch (err) {
    logAlert(err, 'TW')
    return
  }
  return od
}
