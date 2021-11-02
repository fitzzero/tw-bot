import moment from 'moment'
import { worldId } from './config'
import { connectDb } from './db/connect'
import { updateOrCreateWorld, updateLastSync } from './db/world/worldController'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { PromiseFn } from './types/methods'
import { World } from './types/world'
import { logger } from './utility/logger'
import { withinLastHour } from './utility/time'

let worldInMemory: World | undefined = undefined

export const getActiveWorld = (): World | undefined => {
  return worldInMemory
}

export interface LoopFnProps {
  world: World
}

export type LoopFn = (props: LoopFnProps) => Promise<void>

export const startLoop: PromiseFn<void, void> = async () => {
  // Load world
  connectDb(worldId)
  worldInMemory = await updateOrCreateWorld(worldId)
  if (!worldInMemory) {
    logger({ prefix: 'alert', message: `Database: Error loading w${worldId}` })
    return
  }

  loop()
  setInterval(function () {
    loop()
  }, 60 * 1000) // 60 * 1000 milsec
  return
}

const loop: PromiseFn<void, void> = async () => {
  if (!worldInMemory) return
  const lastSync = worldInMemory.lastSync
    ? moment(worldInMemory.lastSync)
    : undefined

  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })

  // Sync TW if it's been more than hour since last sync
  if (!withinLastHour(lastSync)) {
    const newSync = moment()
    syncTw({ world: worldInMemory })
    updateLastSync({ worldId: worldId })
    worldInMemory.lastSync = newSync
  } else {
    logger({ prefix: 'success', message: 'TW: In Sync (Skipped)' })
  }

  // Sync Todoist Projects
  syncProject({ world: worldInMemory })
  return
}
