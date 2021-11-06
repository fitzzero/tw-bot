import moment from 'moment'
import { worldId } from './config'
import { connectDb } from './db/connect'
import { loadActivePlayers } from './db/player/playerController'
import { loadActiveTribes } from './db/tribe/tribeController.ts'
import { loadActiveAccounts } from './db/account/accountController'
import { loadActiveVillages } from './db/village/villageController'
import {
  updateLastSync,
  loadActiveWorld,
  getActiveWorld,
} from './db/world/worldController'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { PromiseFn } from './@types/methods'
import { World } from './@types/world'
import { logAlert, logger } from './utility/logger'
import { withinLastHour } from './utility/time'
import { loadActiveTrackers } from './db/tracker/trackerController'

export interface LoopFnProps {
  world: World
}

export type LoopFn = (props: LoopFnProps) => Promise<void>

const loadData: PromiseFn<void, void> = async () => {
  connectDb(worldId)
  await loadActiveWorld()
  await loadActiveAccounts()
  await loadActiveTrackers()
  await loadActiveTribes()
  await loadActivePlayers()
  await loadActiveVillages()
  return
}

export const startLoop: PromiseFn<void, void> = async () => {
  // Load data
  await loadData()

  loop()
  setInterval(function () {
    loop()
  }, 60 * 1000) // 60 * 1000 milsec
  return
}

const loop: PromiseFn<void, void> = async () => {
  const world = getActiveWorld()

  if (!world) {
    logAlert('Unable to load active world, stopping loop', 'Loop')
    return
  }
  const lastSync = world.lastSync ? moment(world.lastSync) : undefined

  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })

  // Sync TW if it's been more than hour since last sync
  if (!withinLastHour(lastSync)) {
    syncTw({ world })
    updateLastSync()
  } else {
    logger({ prefix: 'success', message: 'TW: In Sync (Skipped)' })
  }

  // Sync Todoist Projects
  syncProject({ world })
  return
}
