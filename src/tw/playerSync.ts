import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logAlert, logger } from '../utility/logger'
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

  if (!playerData || !od || !oda || !odd || !ods) {
    logAlert('Data issue, skipping Player sync', 'TW')
    return
  }

  for (const data of playerData) {
    if (data[0] === '' || data[0] === null) continue
    const playerId = data[0]
    const playerOd = od.find(data => data[1] === playerId)
    const playerOda = oda.find(data => data[1] === playerId)
    const playerOdd = odd.find(data => data[1] === playerId)
    const playerOds = ods.find(data => data[1] === playerId)

    const playerData: PlayerData = {
      id: playerId,
      name: decodeURIComponent(data[1]).replaceAll('+', ' '),
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

const fetchPlayers = async (world: string): Promise<string[][] | undefined> => {
  let api = `${worldPath(world)}map/player.txt`
  let players: string[][] = []
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/player.txt'
  }
  try {
    const response = await fetch(api)
    if (response.status >= 400) {
      throw new Error(`TW Server ${response.status}`)
    }
    players = parseCsv(await response.text())
    if (!players || players.length == 0) {
      throw new Error(`Error loading world ${world} players`)
    }
  } catch (err) {
    logAlert(err, 'TW')
    return
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
): Promise<string[][] | undefined> => {
  let api = `${worldPath(world)}map/kill_${type}.txt`
  let od: string[][] = []
  if (world == 'dev') {
    api = `https://fitzzero.sirv.com/tribalwars/example-data/kill_${type}.txt`
  }
  try {
    const response = await fetch(api)
    if (response.status >= 400) {
      throw new Error(`TW Server: ${response.status}`)
    }
    od = parseCsv(await response.text())
    if (!od || od.length == 0) {
      throw new Error(`Error loading world ${world} opponents defeated`)
    }
  } catch (err) {
    logAlert(err, 'TW')
    return
  }
  return od
}
