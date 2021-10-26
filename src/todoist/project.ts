import { Project } from 'todoist/dist/v8-types'
import { LoopFn } from '../loop'
import { logger } from '../utility/logger'
import { todoist } from './connect'
import { syncItems } from './items'

let projectInMemory: Project | undefined = undefined

export const getActiveProject = (): Project | undefined => projectInMemory

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

  if (!projectInMemory) {
    projectInMemory = todoist.projects
      .get()
      .find(project => project.name === world.name)
  }
  if (!projectInMemory) {
    logger({
      prefix: 'alert',
      message: `Todoist: Project ${world.name} Not Found`,
    })
    return
  }

  await syncItems({ project: projectInMemory })

  logger({
    prefix: 'success',
    message: `Todoist: Synced Project ${world.name}`,
  })
}
