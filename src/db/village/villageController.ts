import { Fn, PromiseFn } from '../../types/methods'
import {
  BulkUpdateVillage,
  GetVillage,
  RemoveVillage,
  Village,
  VillageData,
} from '../../types/village'
import { logger, logSuccess } from '../../utility/logger'
import { VillageModel } from './villageSchema'
import { addVillageStats } from './villageStats'

let activeVillages: Village[] = []

export const getActiveVillages: Fn<void, Village[]> = () => {
  return activeVillages
}

export const loadActiveVillages: PromiseFn<void, void> = async () => {
  const loadedVillages: Village[] = []
  const villageCollection = await VillageModel.find({})
  villageCollection.forEach(village => {
    loadedVillages.push(village)
  })
  activeVillages = loadedVillages
  logSuccess(`Loaded ${activeVillages.length} villages`, 'Database')
  return
}

export const saveActiveVillages: PromiseFn<void, void> = async () => {
  const bulkOps = activeVillages.map(village => {
    return {
      updateOne: {
        filter: { _id: village._id },
        update: village.toJSON,
        upsert: true,
      },
    }
  })

  await VillageModel.bulkWrite(bulkOps)
  logSuccess(`Saved ${activeVillages.length} villages`, 'Database')
  return
}

export const cleanDeletedVillages: PromiseFn<BulkUpdateVillage, void> = async ({
  newVillageData,
}) => {
  logger({
    prefix: 'start',
    message: `Database: Checking ${activeVillages.length} villages...`,
  })
  let removedCount = 0

  await Promise.all(
    activeVillages.map(async (village, index) => {
      const foundInNewData = newVillageData.find(
        data => data._id === village._id
      )
      if (!foundInNewData) {
        removedCount = removedCount + 1
        await removeVillage({ village })
        activeVillages.splice(index, 1)
      }
    })
  )

  logSuccess(
    `Database: Removed ${removedCount} old villages, new count: ${activeVillages.length}`,
    'Database'
  )
  return
}

export const getVillage: GetVillage = async villageId => {
  const village = await VillageModel.findById(villageId)
  return village
}

export const removeVillage: PromiseFn<RemoveVillage, void> = async ({
  village,
}) => {
  try {
    village.remove()
  } catch (err) {
    logger({ prefix: 'alert', message: `Database: ${err}` })
  }
  return
}

export const updateOrCreateVillage: Fn<VillageData, void> = villageData => {
  const index = activeVillages.findIndex(
    village => village._id === villageData._id
  )
  if (index === -1) {
    const village = new VillageModel(villageData)
    activeVillages.push(village)
  } else {
    let village = activeVillages[index]
    // Stats
    village = addVillageStats({ village, newData: villageData })
    // Updates
    village.name = villageData.name
    village.playerId = villageData.playerId
    village.points = villageData.points
    village.rank = villageData.rank
    village.lastSync = villageData.lastSync
    // Migrations
    village.k = villageData.k
    village.number = villageData.number

    activeVillages[index] = village
  }
  return
}
