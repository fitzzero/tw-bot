import { Schema, model } from 'mongoose'
import { Village, VillageHistoric } from '../types/village'
import { logger } from '../utility/logger'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const villageSchema = new Schema<Village>(
  {
    _id: { type: Number, required: true },
    name: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    player: Number,
    points: Number,
    rank: Number,
    lastSync: Date,
    history: [Object],
  },
  schemaOptions
)

const VillageModel = model<Village>('Village', villageSchema)

export const updateOrCreateVillage = async (
  data: VillageHistoric
): Promise<void> => {
  try {
    let village = await VillageModel.findById(data._id)
    if (!village) {
      village = new VillageModel(data)
    } else {
      village.name = data.name
      village.x = data.x
      village.y = data.y
      village.player = data.player
      village.rank = data.rank
      village.lastSync = data.lastSync
      village.history.unshift(data)
    }
    village.save()
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
  }
}
