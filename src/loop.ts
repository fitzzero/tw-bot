import { isDev } from './config'
import { syncTw, syncTwInProgress } from './tw/tribalWars'
import { logAlert, logger } from './utility/logger'
import { momentTimeZone, validateMoment } from './utility/time'
import { players } from './sheet/players'
import { runDevTests } from './devTests'
import { loadDoc } from './sheet/connect'
import { settings } from './sheet/settings'
import { villages } from './sheet/villages'
import { tribes } from './sheet/tribes'
import { channels } from './sheet/channels'
import { messages } from './sheet/messages'
import { syncDashboard } from './discord/dashboard'
import { syncProject } from './todoist/project'
import { accounts } from './sheet/accounts'
import { units } from './sheet/units'
import { incomings } from './sheet/incomings'
import moment from 'moment'
import { registerCommands } from './discord/commands'

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
  if (timeForLoop(world?.lastUpdate) && !syncTwInProgress()) {
    await settings.bump(world.id)
    syncTw(world.value)
    await syncDashboard()
  }

  // Sync Todoist Projects
  syncProject(world.value)
  // Sync incoming attacks
  incomings.syncIncomings()

  return
}

const preLoadAndSyncData = async () => {
  // TW Data
  await settings.loadData()
  await tribes.loadData()
  await players.loadData()
  await villages.loadData()
  await units.loadData()
  await incomings.loadData()

  // Discord Data
  await accounts.loadData()
  await channels.loadData()
  await messages.loadData()

  // Discord Sync
  await channels.syncChannels()
  await syncDashboard()
  await registerCommands()
}

export const timeForLoop = (date: string) => {
  const lastSync = validateMoment(date)
  if (!lastSync) return true
  return (
    !lastSync.isSame(moment.tz(momentTimeZone), 'hour') &&
    moment().minute() > 10
  )
}
