import moment from 'moment'
import { Schema, model } from 'mongoose'
import { isDev } from '../config'
import { getActiveWorld } from '../loop'
import { VoidFnProps } from '../types/methods'
import { UpdateWorld, World } from '../types/world'
import { logger } from '../utility/logger'

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

const WorldModel = model<World>('World', worldSchema)

export const updateOrCreateWorld = async (
  worldId: number
): Promise<World | undefined> => {
  try {
    let world = await WorldModel.findById(worldId)
    if (!world) {
      world = new WorldModel({
        _id: worldId,
        name: `w${worldId}`,
        testData: !!isDev,
      })
    } else {
      // Migrations
      if (!world?.name) world.name = `w${worldId}`
    }
    logger({ prefix: 'success', message: `Database: Loaded w${world.id}` })
    await world.save()
    return world
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return
  }
}

export const updateLastSync: VoidFnProps<{ worldId: number }> = async ({
  worldId,
}) => {
  const world = await WorldModel.findById(worldId)
  if (!world) {
    logger({
      prefix: 'alert',
      message: `Database: Failed to update lastSync for w${worldId}`,
    })
    return
  }
  const lastSync = moment()
  world.lastSync = lastSync
  world.save()
  return
}

export const patchWorld = async (data: UpdateWorld): Promise<World | null> => {
  const world = getActiveWorld()
  if (!world) return null

  if (data.start) world.start = data.start
  if (data.radius) world.radius = data.radius

  try {
    await world.save()
    logger({ prefix: 'success', message: `Database: Updated ${world.name}` })
    return world
  } catch (err) {
    logger({ prefix: 'alert', message: `Database: ${err}` })
    return null
  }
}
