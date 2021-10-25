import { activeWorlds } from './config'
import { connectDb } from './db/connect'
import { updateOrCreateWorld } from './db/world'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { World } from './types/world'
import { logger } from './utility/logger'

export interface LoopFnProps {
  world: World
}

export type LoopFn = (props: LoopFnProps) => Promise<void>

export const startLoop = (dev?: boolean): void => {
  const worlds = dev ? [1] : activeWorlds

  loop(worlds)
  setInterval(function () {
    loop(worlds)
  }, 60 * 1000) // 60 * 1000 milsec
}

const loop = async (worlds: number[]): Promise<void> => {
  logger({ prefix: 'success', message: 'Loop: Starting Update' })

  worlds.forEach(worldId => {
    syncWorld(worldId)
  })
}

const syncWorld = async (worldId: number): Promise<void> => {
  await connectDb(worldId)

  const world = await updateOrCreateWorld(worldId)
  if (!world) {
    logger({ prefix: 'alert', message: 'Database: Failed to load world' })
    return
  }
  syncTw({ world })
  syncProject({ world })
}
