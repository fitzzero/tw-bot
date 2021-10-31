import { discordAlert } from '../discord/alert'
import { getActiveWorld } from '../loop'
import { VoidFnProps } from '../types/methods'
import {
  BulkUpdateVillage,
  GetVillage,
  RemoveVillage,
  UpdateVillage,
  Village,
  VillageData,
  VillageStats,
} from '../types/village'
import { Coordinate } from '../types/world'
import { logger } from '../utility/logger'
import { coordinatesInRange } from '../utility/twUtility'
import { VillageModel } from './villageSchema'

export const cleanDeletedVillages: VoidFnProps<BulkUpdateVillage> = async ({
  villageData,
}) => {
  const allVillages = await VillageModel.find()
  logger({
    prefix: 'start',
    message: `Database: Checking ${allVillages.length} villages...`,
  })
  let removedCount = 0

  await Promise.all(
    allVillages.map(async village => {
      const foundInNewData = villageData.find(data => data._id === village._id)
      if (!foundInNewData) {
        removedCount = removedCount + 1
        await removeVillage({ village })
      }
    })
  )

  logger({
    prefix: 'success',
    message: `Database: Removed ${removedCount} old villages`,
  })
  return
}

export const getVillage: GetVillage = async villageId => {
  const village = await VillageModel.findById(villageId)
  return village
}

export const removeVillage: VoidFnProps<RemoveVillage> = async ({
  village,
}) => {
  try {
    village.remove()
  } catch (err) {
    logger({ prefix: 'alert', message: `Database: ${err}` })
  }
  return
}

let testData = false
let checkStats = true
let start: Coordinate | undefined = undefined
let radius: number | undefined = undefined
let foundInRange = 0

export const villagesInRange = (): number => foundInRange

const statAlerts = (village: Village, newStats: VillageStats): void => {
  if (!village.stats) return
  if (checkStats && !start) {
    const world = getActiveWorld()
    if (world?.testData) {
      start = { x: 500, y: 500 }
      radius = 10
      testData = true
      logger({ prefix: 'success', message: `World: Using test stat values` })
    } else if (!world?.radius || !world?.start) {
      checkStats = false
      logger({
        prefix: 'alert',
        message: `World: No start and radius values, skipping stats`,
      })
      return
    } else {
      start = world.start
      radius = world.radius
    }
  }
  if (!checkStats || !start || !radius) {
    return
  }
  if (coordinatesInRange(start, radius, { x: village.x, y: village.y })) {
    if (foundInRange === 0 && testData) {
      newStats.lastPointDecrease = 0
    }
    if (foundInRange === 1 && testData) {
      village.stats.stale = true
    }
    if (foundInRange === 2 && testData) {
      newStats.stale = true
      village.stats.stale = false
    }
    const oldStats = village.stats
    foundInRange++
    if (newStats.stale && !oldStats?.stale) {
      discordAlert({
        message: `Village: ${village._id} (${village.name}) has gone inactive`,
      })
    }
    if (!newStats.stale && oldStats?.stale) {
      discordAlert({
        message: `Village: ${village._id} (${village.name}) no longer inactive`,
      })
    }
    if (newStats.lastPointDecrease === 0 && oldStats.lastPointDecrease > 0) {
      discordAlert({
        message: `Village: ${village._id} (${village.name}) has just dropped points`,
      })
    }
  }

  return
}

const stats = (village: Village, newData: VillageData): Village => {
  let lastPointIncrease = village.stats?.lastPointIncrease || 0
  let lastPointDecrease = village.stats?.lastPointDecrease || 0
  let stale = false
  if (village.points === newData.points) {
    lastPointIncrease++
    lastPointDecrease++
  }
  if (newData.points > village.points) {
    lastPointIncrease = 0
  }
  if (newData.points < village.points) {
    lastPointDecrease = 0
  }
  if (lastPointIncrease > 24) {
    stale = true
  }

  const newStats: VillageStats = {
    lastPointIncrease,
    lastPointDecrease,
    stale,
  }

  statAlerts(village, newStats)
  village.stats = newStats

  return village
}

export const updateOrCreateVillage: VoidFnProps<UpdateVillage> = async ({
  villageData,
}) => {
  try {
    let village = await VillageModel.findById(villageData?._id)
    if (!village) {
      village = new VillageModel(villageData)
    } else {
      // Stats
      village = stats(village, villageData)
      // Updates
      village.name = villageData.name
      village.playerId = villageData.playerId
      village.points = villageData.points
      village.rank = villageData.rank
      village.lastSync = villageData.lastSync
      // Migrations
      village.k = villageData.k
      village.number = villageData.number
      await village.save()
      return
    }
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
  }
}
