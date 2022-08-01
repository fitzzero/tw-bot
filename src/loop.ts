import moment from 'moment'
import { isDev, worldId } from './config'
import { syncProject } from './todoist/project'
import { syncTw } from './tw/tribalWars'
import { World } from './@types/world'
import { logAlert, logger } from './utility/logger'
import { nowString, withinLastHour } from './utility/time'
import { players } from './sheet/players'
import { runDevTests } from './devTests'
import { loadDoc } from './sheet/connect'
import { settings } from './sheet/settings'

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
  await players.loadData()

  loop()
  setInterval(function () {
    loop()
  }, 60 * 1000) // 60 * 1000 milsec
  return
}

const loop = async () => {
  const world = settings.getById('world')

  // if (!world) {
  //   logAlert('Unable to load active world, stopping loop', 'Loop')
  //   return
  // }

  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })

  // Sync TW if it's been more than hour since last sync
  if (!withinLastHour(world?.lastUpdate)) {
    if (world) {
      syncTw(world.value)
      settings.updateOrAdd({ id: 'world' }, true)
    } else {
      logAlert('No active world set', 'TW')
    }
  }

  // Sync Todoist Projects
  // syncProject({ world })
  return
}
