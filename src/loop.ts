import moment from 'moment'
import { isDev, worldId } from './config'
import { syncProject } from './todoist/project'
import { syncTw, syncTwInProgress } from './tw/tribalWars'
import { World } from './@types/world'
import { logAlert, logger } from './utility/logger'
import { nowString, withinLastHour } from './utility/time'
import { players } from './sheet/players'
import { runDevTests } from './devTests'
import { loadDoc } from './sheet/connect'
import { settings } from './sheet/settings'
import { getQueueLength } from './sheet/saveQueue'
import { villages } from './sheet/villages'
import { tribes } from './sheet/tribes'

export interface LoopFnProps {
  world: World
}

export type LoopFn = (props: LoopFnProps) => Promise<void>

export const startLoop = async () => {
  await loadDoc()

  // Dev Pre Loop Tests
  if (isDev) {
    const testPass = await runDevTests()
    if (!testPass) return
  }

  // Load data
  await settings.loadData()
  await tribes.loadData()
  await players.loadData()
  await villages.loadData()

  loop()
  setInterval(function () {
    loop()
  }, 60 * 1000) // 60 * 1000 milsec
  return
}

const loop = async () => {
  const world = settings.getById('world')

  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })

  // Sync TW if it's been more than hour since last sync
  if (!withinLastHour(world?.lastUpdate) && !syncTwInProgress()) {
    if (world) {
      syncTw(world.value)
      world.lastUpdate = nowString()
      world.save()
    } else {
      logAlert('No active world set', 'TW')
    }
  }

  // Log queue size if active
  const saveQueue = getQueueLength()
  if (saveQueue > 0) {
    logger({ prefix: 'start', message: `${saveQueue} Updates queued to save` })
  }

  // Sync Todoist Projects
  // syncProject({ world })
  return
}
