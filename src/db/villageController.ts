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

let checkStats = true
let start: Coordinate | undefined = undefined
let radius: number | undefined = undefined

const statAlerts = (village: Village, newStats: VillageStats): void => {
  if (checkStats && !start) {
    const world = getActiveWorld()
    if (!world?.radius || !world?.start) {
      checkStats = false
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
    console.log('found 1 village in range')
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

  const newStats: VillageStats = (village.stats = {
    lastPointIncrease,
    lastPointDecrease,
    stale,
  })

  if (village.stats) {
    statAlerts(village, newStats)
  }
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
      village.player = villageData.player
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
