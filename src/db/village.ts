import { Schema, model } from 'mongoose'
import { Village, VillageData } from '../types/village'
import { logger } from '../utility/logger'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const villageSchema = new Schema<Village>(
  {
    _id: { type: String, required: true },
    name: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    k: Number,
    player: Number,
    points: Number,
    rank: Number,
    lastSync: Date,
  },
  schemaOptions
)

export const VillageModel = model<Village>('Village', villageSchema)

export const updateOrCreateVillage = async (
  villageData: VillageData
): Promise<Village | null> => {
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
    }
    await village.save()
    return village
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return null
  }
}
