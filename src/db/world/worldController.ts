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
  if (!activeWorld) return null

  if (data.start) activeWorld.start = data.start
  if (data.radius) activeWorld.radius = data.radius
  if (data.roles) activeWorld.roles = data.roles

  try {
    await saveWorld()
    logger({
      prefix: 'success',
      message: `Database: Updated ${activeWorld.name}`,
    })
    return activeWorld
  } catch (err) {
    logger({ prefix: 'alert', message: `Database: ${err}` })
    return null
  }
}

export const addDashboardMessage: PromiseFn<
  DashboardMessage,
  DashboardMessage
> = async messageData => {
  if (!activeWorld) return messageData
  if (!activeWorld.dashboard) {
    activeWorld.dashboard = []
  }
  activeWorld.dashboard.push(messageData)
  saveWorld()
  return messageData
}

export const updateDashboardMessage: PromiseFn<DashboardMessage, void> =
  async messageData => {
    if (!activeWorld) return
    const index = activeWorld?.dashboard?.findIndex(
      message => (message.key = messageData.key)
    )
    if (!index || !activeWorld.dashboard) return
    console.log(3)
    activeWorld.dashboard[index] = messageData
    await saveWorld()
  }
