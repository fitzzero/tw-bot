import moment from 'moment'
import { isDev, testWorldId, prodWorldId } from './config'
import { connectDb } from './db/connect'
import { updateOrCreateWorld } from './db/world'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { VoidFn } from './types/methods'
import { World } from './types/world'
import { logger } from './utility/logger'
import { withinLastHour } from './utility/time'

let worldInMemory: World | undefined = undefined

export interface LoopFnProps {
  world: World
}

export type LoopFn = (props: LoopFnProps) => Promise<void>

export const startLoop: VoidFn = async () => {
  // Load world
  const worldId = isDev ? testWorldId : prodWorldId
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
}

const loop: VoidFn = async () => {
  if (!worldInMemory) return
  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })
  const lastSync = moment(worldInMemory.lastSync)

  // Sync Todoist Projects
  syncProject({ world: worldInMemory })

  // Sync TW if it's been more than hour since last sync
  if (!withinLastHour(lastSync)) {
    worldInMemory.lastSync = moment()
    await worldInMemory.save().then(() => {
      logger({
        prefix: 'success',
        message: `Saved ${worldInMemory?.name} lastSync`,
      })
    })
    syncTw({ world: worldInMemory })
  }
}
