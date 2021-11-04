import moment from 'moment'
import { isDev, worldId } from '../../config'
import { Fn, PromiseFn } from '../../types/methods'
import {
  GetWorld,
  WorldEditProps,
  World,
  DashboardMessage,
} from '../../types/world'
import { logger, logSuccess } from '../../utility/logger'
import { WorldModel } from './worldSchema'

let activeWorld: World | undefined = undefined

export const getActiveWorld: Fn<void, World | undefined> = () => activeWorld

export const loadActiveWorld: PromiseFn<void, void> = async () => {
  activeWorld = await findOrCreateWorld({ id: worldId })
  return
}

export const saveWorld: PromiseFn<void, void> = async () => {
  if (activeWorld) {
    await activeWorld.save()
    logSuccess(`Saved ${activeWorld.name}`)
  }
  return
}

export const findOrCreateWorld: PromiseFn<GetWorld, World> = async ({ id }) => {
  let world = await WorldModel.findById(id)
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
}

export const updateLastSync: PromiseFn<void, void> = async () => {
  if (!activeWorld) return
  const lastSync = moment()
  activeWorld.lastSync = lastSync
  await saveWorld()
  return
}

export const patchWorld = async (
  data: WorldEditProps
): Promise<World | null> => {
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

export const addDashboardMessage: PromiseFn<DashboardMessage, void> =
  async messageData => {
    if (!activeWorld) return
    if (!activeWorld.dashboard) {
      activeWorld.dashboard = []
    }
    activeWorld.dashboard.push(messageData)
    saveWorld()
    return
  }
