import fetch from 'cross-fetch'
import { LoopFn } from '../loop'
import { TribeData } from '../@types/tribe'
import { World } from '../@types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const syncTribes: LoopFn = async ({ world }) => {
  try {
    // Data: id, name, tag, members, villages, points, all_points, rank
    const tribes = await fetchTribes(world)

    // Data: rank, id, kills
    const od = await fetchTribeOd(world, 'all')
    const oda = await fetchTribeOd(world, 'att')
    const odd = await fetchTribeOd(world, 'def')

    await Promise.all(
      tribes.map(async data => {
        if (data[0] === '' || data[0] === null) return
        const tribeId = data[0]
        const tribeOd = od.find(data => data[1] === tribeId)
        const tribeOda = oda.find(data => data[1] === tribeId)
        const tribeOdd = odd.find(data => data[1] === tribeId)

        const tribeData: TribeData = {
          _id: data[0],
          name: data[1],
          tag: data[2],
          members: parseInt(data[3]),
          villages: parseInt(data[4]),
          points: parseInt(data[5]),
          allPoints: parseInt(data[6]),
          rank: parseInt(data[7]) || null,
          od: tribeOd ? parseInt(tribeOd[2]) : 0,
          oda: tribeOda ? parseInt(tribeOda[2]) : 0,
          odd: tribeOdd ? parseInt(tribeOdd[2]) : 0,
          lastSync: world.lastSync,
        }
        if (!tribeData || !tribeData._id) {
          return
        }
        // updateOrCreateTribe(tribeData)
        // await addTribeHistory(tribeData)
      })
    )

    // saveActiveTribes()
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
  }
}

export const fetchTribes = async (world: World): Promise<string[][]> => {
  let api = `https://us${world._id}.tribalwars.us/map/ally.txt`
  if (world.testData) {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/ally.txt'
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const tribes = parseCsv(await response.text())
  if (!tribes || tribes.length == 0) {
    throw new Error(`TW: Error loading world ${world._id} tribes`)
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${tribes?.length} tribes...`,
  })

  return tribes
}

const fetchTribeOd = async (
  world: World,
  type: 'att' | 'def' | 'all'
): Promise<string[][]> => {
  let api = `https://us${world._id}.tribalwars.us/map/kill_${type}_tribe.txt`
  if (world.testData) {
    api = `https://fitzzero.sirv.com/tribalwars/example-data/kill_${type}_tribe.txt`
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const od = parseCsv(await response.text())
  if (!od || od.length == 0) {
    throw new Error(
      `TW: Error loading world ${world._id} opponents defeated tribe`
    )
  }
  return od
}
