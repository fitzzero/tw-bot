import fetch from 'cross-fetch'
import { updateOrCreatePlayer } from '../db/player'
import { addPlayerHistory } from '../db/playerHistory'
import { PlayerData } from '../types/player'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const loadPlayers = async (world: World): Promise<void> => {
  try {
    const response = await fetch(
      `https://us${world._id}.tribalwars.us/map/player.txt`
    )
    if (response.status >= 400) {
      throw new Error(`TW Server: ${response.status}`)
    }
    const players = parseCsv(await response.text())
    if (!players || players.length == 0) {
      logger({
        prefix: 'alert',
        message: `TW: Error loading world ${world._id} players`,
      })
      return
    }
    logger({
      prefix: 'success',
      message: `TW: Loading ${players?.length} players...`,
    })

    await Promise.all(
      players.map(async (data: string[]) => {
        if (data[0] === '' || data[0] === null) return
        const playerData: PlayerData = {
          _id: data[0],
          name: data[1],
          tribe: data[2],
          villages: parseInt(data[3]),
          points: parseInt(data[4]),
          rank: parseInt(data[5]) || null,
          lastSync: world.lastSync,
        }
        if (!playerData || !playerData._id) {
          return
        }
        await updateOrCreatePlayer(playerData)
        await addPlayerHistory(playerData)
      })
    )
    logger({
      prefix: 'success',
      message: `TW: Synced ${players?.length} players for world ${world._id}`,
    })
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
  }
}
