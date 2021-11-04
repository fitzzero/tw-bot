import { Schema, model } from 'mongoose'
import { Player } from '../../types/player'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const playerSchema = new Schema<Player>(
  {
    _id: { type: String, required: true },
    name: String,
    tribe: String,
    villages: Number,
    points: Number,
    rank: Number,
    od: Number,
    oda: Number,
    odd: Number,
    ods: Number,
    lastSync: Date,
  },
  schemaOptions
)

export const PlayerModel = model<Player>('Player', playerSchema)
