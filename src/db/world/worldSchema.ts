import { Schema, model } from 'mongoose'
import { World } from '../../types/world'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const worldSchema = new Schema<World>(
  {
    _id: { type: Number, required: true },
    name: String,
    lastSync: Date,
    testData: Boolean,
    start: {
      x: Number,
      y: Number,
    },
    radius: Number,
  },
  schemaOptions
)

export const WorldModel = model<World>('World', worldSchema)
