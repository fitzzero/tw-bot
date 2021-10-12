import fetch from 'cross-fetch'
import { updateOrCreateTribe } from '../db/tribe'
import { addTribeHistory } from '../db/tribeHistoric'
import { TribeData } from '../types/tribe'
import { World } from '../types/world'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const loadTribes = async (world: World): Promise<void> => {
  try {
    const response = await fetch(
      `https://us${world._id}.tribalwars.us/map/ally.txt`
    )
    if (response.status >= 400) {
      throw new Error(`TW Server: ${response.status}`)
    }
    const tribes = parseCsv(await response.text())
    if (!tribes || tribes.length == 0) {
      logger({
        prefix: 'alert',
        message: `TW: Error loading world ${world._id} tribes`,
      })
      return
    }
    logger({
      prefix: 'success',
      message: `TW: Loading ${tribes?.length} tribes...`,
    })

    await Promise.all(
      tribes.map(async (data: string[]) => {
        if (data[0] === '' || data[0] === null) return
        const tribeData: TribeData = {
          _id: data[0],
          name: data[1],
          tag: data[2],
          members: parseInt(data[3]),
          villages: parseInt(data[4]),
          points: parseInt(data[5]),
          allPoints: parseInt(data[6]),
          rank: parseInt(data[7]) || null,
          lastSync: world.lastSync,
        }
        if (!tribeData || !tribeData._id) {
          return
        }
        await updateOrCreateTribe(tribeData)
        await addTribeHistory(tribeData)
      })
    )
    logger({
      prefix: 'success',
      message: `TW: Synced ${tribes?.length} tribes for world ${world._id}`,
    })
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
  }
}
