import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'
import { PlayerData, players } from '../sheet/players'
import { worldPath } from './world'

export const syncPlayers = async (world: string) => {
  await players.loadRows()
  // Data: id, name, ally, villages, points, rank
  const playerData = await fetchPlayers(world)

  // Data: rank, id, kills
  const od = await fetchOd(world, 'all')
  const oda = await fetchOd(world, 'att')
  const odd = await fetchOd(world, 'def')
  const ods = await fetchOd(world, 'sup')

  for (const data of playerData) {
    if (data[0] === '' || data[0] === null) break
    const playerId = data[0]
    const playerOd = od.find(data => data[1] === playerId)
    const playerOda = oda.find(data => data[1] === playerId)
    const playerOdd = odd.find(data => data[1] === playerId)
    const playerOds = ods.find(data => data[1] === playerId)

    const playerData: PlayerData = {
      id: playerId,
      name: decodeURIComponent(data[1]),
      tribe: data[2],
      villages: data[3],
      points: data[4],
      rank: data[5] || '0',
      od: playerOd ? playerOd[2] : '0',
      oda: playerOda ? playerOda[2] : '0',
      odd: playerOdd ? playerOdd[2] : '0',
      ods: playerOds ? playerOds[2] : '0',
    }
    if (playerData?.id) {
      await players.auditAndUpdate({ ...playerData })
    }
  }
  logger({
    prefix: 'success',
    message: `TW: Players synced`,
  })
  return
}

const fetchPlayers = async (world: string): Promise<string[][]> => {
  let api = `${worldPath(world)}map/player.txt`
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/player.txt'
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const players = parseCsv(await response.text())
  if (!players || players.length == 0) {
    throw new Error(`TW: Error loading world ${world} players`)
  }
  logger({
    prefix: 'start',
    message: `TW: Loading ${players?.length - 1} players...`,
  })
  return players
}

const fetchOd = async (
  world: string,
  type: 'att' | 'def' | 'sup' | 'all'
): Promise<string[][]> => {
  let api = `${worldPath(world)}map/kill_${type}.txt`
  if (world == 'dev') {
    api = `https://fitzzero.sirv.com/tribalwars/example-data/kill_${type}.txt`
  }

  const response = await fetch(api)
  if (response.status >= 400) {
    throw new Error(`TW Server: ${response.status}`)
  }
  const od = parseCsv(await response.text())
  if (!od || od.length == 0) {
    throw new Error(`TW: Error loading world ${world} opponents defeated`)
  }
  return od
}
