import moment from 'moment'
import { Schema, model } from 'mongoose'
import { World } from '../types/world'
import { logger } from '../utility/logger'
import { withinLastHour } from '../utility/time'
import { villageSchema } from './village'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const worldSchema = new Schema<World>(
  {
    _id: { type: Number, required: true },
    villages: [villageSchema],
    lastSync: Date,
    inSync: Boolean,
    testData: Boolean,
  },
  schemaOptions
)

const WorldModel = model<World>('World', worldSchema)

export const updateOrCreateWorld = async (
  worldId: number
): Promise<World | null> => {
  const lastSync = moment()
  try {
    let world = await WorldModel.findById(worldId)
    if (!world) {
      world = new WorldModel({
        _id: worldId,
        lastSync,
        inSync: false,
        testData: worldId == 1 ? true : false,
      })
    } else {
      world.inSync = withinLastHour(moment(world.lastSync))
      world.lastSync = lastSync
    }
    logger({ prefix: 'success', message: `TW: Loaded world ${world.id}` })
    world.save()
    return world
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return null
  }
}
