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
    roles: {
      app: String,
      browser: String,
    },
    dashboard: [
      {
        key: String,
        channelId: String,
        messageId: String,
        data: Schema.Types.Mixed,
      },
    ],
  },
  schemaOptions
)

export const WorldModel = model<World>('World', worldSchema)
