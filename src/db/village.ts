import { Schema, model } from 'mongoose'
import { Village } from '../types/village'

const schemaOptions = {
  toJSON: { virtuals: true },
}

const villageSchema = new Schema<Village>(
  {
    id: { type: Number, required: true },
    name: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    player: Number,
    points: Number,
    rank: Number,
  },
  schemaOptions
)

const VillageModel = model<Village>('Village', villageSchema)

export const updateOrCreate = async (village: Village): Promise<Village> => {
  return village
}
