import { Schema, model } from 'mongoose'
import { Village } from '../../types/village'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const villageSchema = new Schema<Village>(
  {
    _id: { type: String, required: true },
    name: String,
    number: Number,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    k: Number,
    playerId: String,
    points: Number,
    rank: Number,
    lastSync: Date,
    stats: {
      lastPointDecrease: Number,
      lastPointIncrease: Number,
      stale: Boolean,
    },
  },
  schemaOptions
)

export const VillageModel = model<Village>('Village', villageSchema)
