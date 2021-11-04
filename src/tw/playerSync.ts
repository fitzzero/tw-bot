import fetch from 'cross-fetch'
import {
  saveActivePlayers,
  updateOrCreatePlayer,
} from '../db/player/playerController'
import { addPlayerHistory } from '../db/player/playerHistory'
import { LoopFn } from '../loop'
import { PlayerData } from '../types/player'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const syncPlayers: LoopFn = async ({ world }) => {
  try {
    // Data: id, name, ally, villages, points, rank
    const players = await fetchPlayers(world)

    // Data: rank, id, kills
    const od = await fetchOd(world, 'all')
    const oda = await fetchOd(world, 'att')
    const odd = await fetchOd(world, 'def')
    const ods = await fetchOd(world, 'sup')

    await Promise.all(
      players.map(async data => {
        if (data[0] === '' || data[0] === null) return
        const playerId = data[0]
        const playerOd = od.find(data => data[1] === playerId)
        const playerOda = oda.find(data => data[1] === playerId)
        const playerOdd = odd.find(data => data[1] === playerId)
        const playerOds = ods.find(data => data[1] === playerId)

        const playerData: PlayerData = {
          _id: playerId,
          name: data[1],
          tribe: data[2],
          villages: parseInt(data[3]),
          points: parseInt(data[4]),
          rank: parseInt(data[5]) || null,
          od: playerOd ? parseInt(playerOd[2]) : 0,
          oda: playerOda ? parseInt(playerOda[2]) : 0,
          odd: playerOdd ? parseInt(playerOdd[2]) : 0,
          ods: playerOds ? parseInt(playerOds[2]) : 0,
          lastSync: world.lastSync,
        }
        if (!playerData || !playerData._id) {
          return
        }
        updateOrCreatePlayer(playerData)
        await addPlayerHistory(playerData)
      })
    )
    await saveActivePlayers()
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
  }
}

const fetchPlayers = async (world: World): Promise<string[][]> => {
  let api = `https://us${world._id}.tribalwars.us/map/player.txt`
  if (world.testData) {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/player.txt'
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const players = parseCsv(await response.text())
  if (!players || players.length == 0) {
    throw new Error(`TW: Error loading world ${world._id} players`)
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${players?.length} players...`,
  })
  return players
}

const fetchOd = async (
  world: World,
  type: 'att' | 'def' | 'sup' | 'all'
): Promise<string[][]> => {
  let api = `https://us${world._id}.tribalwars.us/map/kill_${type}.txt`
  if (world.testData) {
    api = `https://fitzzero.sirv.com/tribalwars/example-data/kill_${type}.txt`
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const od = parseCsv(await response.text())
  if (!od || od.length == 0) {
    throw new Error(`TW: Error loading world ${world._id} opponents defeated`)
  }
  return od
}
