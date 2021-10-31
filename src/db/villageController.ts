import { VoidFnProps } from '../types/methods'
import {
  BulkUpdateVillage,
  GetVillage,
  RemoveVillage,
  UpdateVillage,
} from '../types/village'
import { logger } from '../utility/logger'
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

export const updateOrCreateVillage: VoidFnProps<UpdateVillage> = async ({
  villageData,
}) => {
  try {
    let village = await VillageModel.findById(villageData?._id)
    if (!village) {
      village = new VillageModel(villageData)
    } else {
      village.name = villageData.name
      village.player = villageData.player
      village.points = villageData.points
      village.rank = villageData.rank
      village.lastSync = villageData.lastSync
      // Migrations
      village.k = villageData.k
      village.number = villageData.number
    }
    await village.save()
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
  }
}
