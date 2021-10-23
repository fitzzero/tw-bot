import { World } from '../types/world'
import { logger } from '../utility/logger'
import { todoist } from './connect'
import { syncItems } from './items'

export const syncProject = async (world: World): Promise<void> => {
  if (!todoist) {
    logger({ prefix: 'alert', message: 'Todoist: Error connecting' })
    return
  }
  await todoist.sync()

  const project = todoist.projects
    .get()
    .find(project => project.name === world.name)
  if (!project) {
    logger({
      prefix: 'alert',
      message: `Todoist: Project ${world.name} Not Found`,
    })
    return
  }

  await syncItems(project)

  logger({
    prefix: 'success',
    message: `Todoist: Synced Project ${world.name}`,
  })
}
