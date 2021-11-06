import { Schema, model } from 'mongoose'
import { Tracker } from '../../types/tracker'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const trackerSchema = new Schema<Tracker>(
  {
    _id: { type: String, required: true },
    discord: {
      messageId: String,
    },
    history: [
      {
        time: Date,
        message: String,
      },
    ],
    type: String,
    targetId: String,
    targetType: String,
    lastSync: Date,
  },
  schemaOptions
)

export const TrackerModel = model<Tracker>('Tracker', trackerSchema)
