import { isDev, testWorldId, prodWorldId } from './config'
import { connectDb } from './db/connect'
import { updateOrCreateWorld } from './db/world'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { VoidFn } from './types/methods'
import { World } from './types/world'
import { logger } from './utility/logger'

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
  logger({ prefix: 'start', message: `\nStarting Loop`, logTime: true })
  syncTw({ world: worldInMemory })
  syncProject({ world: worldInMemory })
}
