import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logger } from '../utility/logger'

export const syncWorld = (world: number) => {
  loadVillages(world)
}

export const loadVillages = async (world: number): Promise<void> => {
  fetch(`https://us${world}.tribalwars.us/map/village.txt`)
    .then(res => {
      if (res.status >= 400) {
        throw new Error(`TW Server: ${res.status}`)
      }
      return res.text()
    })
    .then(data => {
      const villages = parseCsv(data)
      logger({
        prefix: 'success',
        message: `TW: Loaded ${villages?.length} villages`,
      })
    })
    .catch(err => {
      console.error(logger({ prefix: 'alert', message: err }))
    })
}
