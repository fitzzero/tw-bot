import { Project } from 'todoist/dist/v8-types'
import { LoopFn } from '../loop'
import { logger } from '../utility/logger'
import { todoist } from './connect'
import { syncItems } from './items'

export interface ProjectFnProps {
  project: Project
}

export type ProjectFn = (props: ProjectFnProps) => Promise<void>

export const syncProject: LoopFn = async ({ world }) => {
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

  await syncItems({ project })

  logger({
    prefix: 'success',
    message: `Todoist: Synced Project ${world.name}`,
  })
}