import fetch from 'cross-fetch'
import { parseCsv } from '../utility/data'
import { logAlert, logger } from '../utility/logger'
import { worldPath } from './world'
import { ConquerData, conquers } from '../sheet/conquers'
import moment from 'moment'
import { momentTimeZone } from '../utility/time'
import { isEmpty } from 'lodash'

export const syncConquers = async (world: string, recent = false) => {
  await conquers.loadRows()
  const conquerData = recent
    ? await fetchConquersRecent(world)
    : await fetchConquers(world)
  if (!conquerData) {
    return
  }

  for (const data of conquerData) {
    if (data[0] === '' || data[0] === null) continue

    const conquerData: ConquerData = {
      id: `${data[0]}-${data[1]}`,
      villageId: data[0],
      unix: data[1],
      newPlayer: data[2],
      oldPlayer: data[3],
    }
    if (conquerData?.id) {
      await conquers.auditAndUpdate(conquerData)
    }
  }
  logger({
    prefix: 'success',
    message: `TW: Conquers synced`,
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

export const fetchConquersRecent = async (world: string) => {
  const unix = moment.tz(momentTimeZone).subtract(2, 'minutes').unix()
  let api = `${worldPath(world)}interface.php?func=get_conquer&since=${unix}`
  if (world == 'dev') {
    api = 'https://fitzzero.sirv.com/tribalwars/example-data/conquerRecent.txt'
  }

  let conquers: string[][] = []

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
  if (isEmpty(conquers) || !conquers[0][1]) {
    logger({
      prefix: 'success',
      message: `TW: No recent conquers`,
    })
    return
  }

  logger({
    prefix: 'start',
    message: `TW: Loading ${conquers?.length} recent conquers...`,
  })
  if (world == 'dev') {
    conquers.forEach((conquer, idx) => {
      conquers[idx][3] = conquer[3].replace('\r', '')
    })
  }

  return conquers
}
