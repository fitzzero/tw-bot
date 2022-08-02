import { Project } from 'todoist/dist/v8-types'
import { logger } from '../utility/logger'
import { todoist } from './connect'
import { syncItems } from './items'

let projectInMemory: Project | undefined = undefined

export const getActiveProject = () => projectInMemory

export const syncProject = async (world: string) => {
  if (!todoist) {
    logger({ prefix: 'alert', message: 'Todoist: Error connecting' })
    return
  }
  await todoist.sync()

  if (!projectInMemory) {
    projectInMemory = todoist.projects
      .get()
      .find(project => project.name === world)
  }
  if (!projectInMemory) {
    logger({
      prefix: 'alert',
      message: `Todoist: Project ${world} Not Found`,
    })
    return
  }

  await syncItems()

  logger({
    prefix: 'success',
    message: `Todoist: Synced Project ${world}`,
  })
}
