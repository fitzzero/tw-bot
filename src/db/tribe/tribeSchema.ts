import { Schema, model } from 'mongoose'
import { Tribe } from '../../types/tribe'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const tribeSchema = new Schema<Tribe>(
  {
    _id: { type: String, required: true },
    name: String,
    tag: String,
    members: Number,
    villages: Number,
    points: Number,
    pointsAll: Number,
    rank: Number,
    od: Number,
    oda: Number,
    odd: Number,
    lastSync: Date,
  },
  schemaOptions
)

export const TribeModel = model<Tribe>('Tribe', tribeSchema)
