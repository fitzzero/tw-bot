import { Schema, model } from 'mongoose'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export interface Village {
  id: number
  name: string
  x: number
  y: number
  player: number
  points: number
  rank: number
}

const villageSchema = new Schema<Village>({
  id: { type: Number, required: true },
  name: String,
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  player: Number,
  points: Number,
  rank: Number,
})

const VillageModel = model<Village>('Village', villageSchema)

export const updateOrCreate = async (village: Village): Promise<Village> => {
  return village
}
