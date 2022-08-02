import { isDev } from './config'
import { syncTw, syncTwInProgress } from './tw/tribalWars'
import { logAlert, logger } from './utility/logger'
import { withinLastHour } from './utility/time'
import { players } from './sheet/players'
import { runDevTests } from './devTests'
import { loadDoc } from './sheet/connect'
import { settings } from './sheet/settings'
import { getQueueLength } from './sheet/saveQueue'
import { villages } from './sheet/villages'
import { tribes } from './sheet/tribes'
import { channels } from './sheet/channels'
import { messages } from './sheet/messages'
import { syncDashboard } from './discord/dashboard'
import { syncProject } from './todoist/project'

export const startLoop = async () => {
  await loadDoc()

  // Dev Pre Loop Tests
  if (isDev) {
    const testPass = await runDevTests()
    if (!testPass) return
  }

  await preLoadAndSyncData()

  loop()
  setInterval(function () {
    loop()
  }, 60 * 1000) // 60 * 1000 milsec
  return
}

const loop = async () => {
  const world = settings.getById('world')
  if (!world) {
    logAlert('No active world set', 'TW')
    return
  }

  logger({ prefix: 'start', message: `Starting Loop`, logTime: true })
  // Re-sync if it's been more than hour since last sync
  if (!withinLastHour(world?.lastUpdate) && !syncTwInProgress()) {
    settings.updateOrAdd(world, true)
    syncTw(world.value)
    channels.syncChannels()
  }

  // Log queue size if active
  const saveQueue = getQueueLength()
  if (saveQueue > 0) {
    logger({ prefix: 'start', message: `${saveQueue} Updates queued to save` })
  }

  // Sync Todoist Projects
  syncProject(world.value)

  return
}

const preLoadAndSyncData = async () => {
  // TW Data
  await settings.loadData()
  await tribes.loadData()
  await players.loadData()
  await villages.loadData()

  // Discord Data
  await channels.loadData()
  await messages.loadData()

  // Discord Sync
  await channels.syncChannels()
  await syncDashboard()
}
