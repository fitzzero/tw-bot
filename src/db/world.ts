import moment from 'moment'
import { Schema, model } from 'mongoose'
import { World } from '../types/world'
import { logger } from '../utility/logger'
import { villageSchema } from './village'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const worldSchema = new Schema<World>(
  {
    _id: { type: Number, required: true },
    lastSync: Date,
    villages: [villageSchema],
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
      world = new WorldModel({ _id: worldId, lastSync })
    } else {
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
