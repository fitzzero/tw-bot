import { Schema, model } from 'mongoose'
import { Tribe, TribeData } from '../types/tribe'
import { logger } from '../utility/logger'

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

export const updateOrCreateTribe = async (
  tribeData: TribeData
): Promise<Tribe | null> => {
  try {
    let tribe = await TribeModel.findById(tribeData?._id)
    if (!tribe) {
      tribe = new TribeModel(tribeData)
    } else {
      tribe.name = tribeData.name
      tribe.tag = tribeData.tag
      tribe.members = tribeData.members
      tribe.villages = tribeData.villages
      tribe.points = tribeData.points
      tribe.allPoints = tribeData.allPoints
      tribe.rank = tribeData.rank
      tribe.od = tribeData.od
      tribe.oda = tribeData.oda
      tribe.odd = tribeData.odd
      tribe.lastSync = tribeData.lastSync
    }
    tribe.save()
    return tribe
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return null
  }
}
