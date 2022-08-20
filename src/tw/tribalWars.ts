import { PlayerData, players } from '../sheet/players'
import { settings, WRSettings } from '../sheet/settings'
import { logger } from '../utility/logger'
import { syncConquers } from './conquerSync'
import { syncPlayers } from './playerSync'
import { syncTribes } from './tribeSync'
import { syncVillages } from './villageSync'

let inProgress = false
let activeAccount: PlayerData | undefined = undefined

export const syncTw = async (world: string) => {
  setActiveAccount()
  inProgress = true
  logger({ prefix: 'start', message: `TW: Starting ${world} sync` })
  await syncTribes(world)
  await syncPlayers(world)
  await syncVillages(world)
  await syncConquers(world)
  inProgress = false
  logger({ prefix: 'success', message: `TW: Sync completed` })
}

const setActiveAccount = () => {
  const playerName = settings.getValue(WRSettings.account)
  if (!playerName) return
  activeAccount = players.getByProperty('name', playerName)
}

export const syncTwInProgress = () => inProgress

export const getActiveAccount = () => activeAccount
