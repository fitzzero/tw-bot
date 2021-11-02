import moment from 'moment'
import { Schema, model } from 'mongoose'
import { isDev } from '../../config'
import { getActiveWorld } from '../../loop'
import { VoidFnProps } from '../../types/methods'
import { UpdateWorld, World } from '../../types/world'
import { logger } from '../../utility/logger'

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
