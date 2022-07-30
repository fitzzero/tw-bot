import moment from 'moment'
import { worldId } from './config'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { World } from './@types/world'
import { logAlert, logger } from './utility/logger'
import { withinLastHour } from './utility/time'
import { startDiscord } from './discord/connect'

export interface LoopFnProps {
  world: World
}

export type LoopFn = (props: LoopFnProps) => Promise<void>

const loadData = async () => {
  return
}

export const startLoop = async () => {
  // Load data
  startDiscord()
  await loadData()

  loop()
  setInterval(function () {
    loop()
  }, 60 * 1000) // 60 * 1000 milsec
  return
}

const loop = async () => {
  const world = null

  if (!world) {
    logAlert('Unable to load active world, stopping loop', 'Loop')
    return
  }
  // const lastSync = world.lastSync ? moment(world.lastSync) : undefined

  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })

  // Sync TW if it's been more than hour since last sync
  // if (!withinLastHour(lastSync)) {
  //   syncTw({ world })
  // } else {
  //   logger({ prefix: 'success', message: 'TW: In Sync (Skipped)' })
  // }

  // Sync Todoist Projects
  syncProject({ world })
  return
}
