import { World } from '../types/world'
import { logger } from '../utility/logger'
import { todoist } from './connect'

export const syncProject = async (world: World): Promise<void> => {
  if (!todoist) {
    logger({ prefix: 'alert', message: 'Todoist: Error connecting' })
    return
  }
  const id = `w${world._id}`
  await todoist.sync()

  const project = todoist.projects.get().find(project => project.name === id)
  if (!project) {
    logger({
      prefix: 'alert',
      message: `Todoist: Project ${id} Not Found`,
    })
    return
  }

  logger({
    prefix: 'success',
    message: `Todoist: Synced Project ${id}`,
  })

  const items = todoist.items.get().map(item => {
    if (item.project_id != project.id) return
    return item
  })
}
