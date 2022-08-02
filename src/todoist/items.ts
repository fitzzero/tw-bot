import moment from 'moment-timezone'
import { Item } from 'todoist/dist/v8-types'
import { ItemData } from '../@types/item'
import { logger } from '../utility/logger'
import { withinLastMinute } from '../utility/time'
import { todoist } from './connect'
import { getActiveProject } from './project'

let itemsInMemory: Item[] | undefined = undefined

export const getActiveItems = (): Item[] | undefined => itemsInMemory

export const syncItems = async () => {
  const project = getActiveProject()
  if (!todoist || !project) return

  itemsInMemory = todoist.items.get()

  // Get items due this minute
  const items = itemsInMemory.filter(item => {
    if (item.project_id != project.id) return
    const due = moment(item?.due?.date)
    if (!due) return false
    const active = withinLastMinute(due)
    if (active) {
      return true
    } else return false
  })
  if (items.length > 0) {
    logger({ prefix: 'success', message: `Found ${items.length} active tasks` })
  }
  items.forEach(item => {
    // TODO: discordAlert({ message: `Todo: ${item?.content}` })
  })
}

export const addItem = async ({ content, projectId, dueString }: ItemData) => {
  if (!todoist?.items) return

  const newItem = (await todoist.items.add({
    content,
    project_id: projectId,
    // Problem with 'todoist' Type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    due: { string: dueString } as any,
  })) as Item

  return newItem
}
