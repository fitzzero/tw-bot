import moment from 'moment-timezone'
import { Item } from 'todoist/dist/v8-types'
import { syncTodoDashboard } from '../discord/dashboardMessages/todo'
import { logAlert, logger } from '../utility/logger'
import { momentUtcOffset, withinLastMinute } from '../utility/time'
import { todoist } from './connect'
import { getActiveProject } from './project'

let itemsInMemory: Item[] | undefined = undefined

export const getActiveItems = (): Item[] | undefined => itemsInMemory

export interface AddItemProps {
  what: string
  when: string
}

export const addItem = async ({ what, when }: AddItemProps) => {
  const project = getActiveProject()
  let newItem: Item | undefined = undefined
  try {
    newItem = (await todoist?.items.add({
      content: what,
      project_id: project?.id,
      // @ts-ignore
      due: { string: when },
    })) as Item
  } catch (err) {
    logAlert(err, 'Todo addItem')
  }

  return newItem
}

export const getItemById = (id: string) => {
  if (!todoist) return
  loadItems()
  if (!itemsInMemory) return

  return itemsInMemory.find(item => `${item.id}` == id)
}

export const loadItems = () => {
  if (!todoist) return
  try {
    itemsInMemory = todoist.items.get()
  } catch (err) {
    logAlert(err, 'Todoist')
    return
  }
}

export const syncItems = async () => {
  const project = getActiveProject()
  if (!todoist || !project) return
  loadItems()
  if (!itemsInMemory) return

  // Get items due this minute
  const items = itemsInMemory.filter(item => {
    if (item.is_deleted || item.in_history || item.project_id != project.id)
      return
    const due = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
    if (!due) return false
    const active = withinLastMinute(due)
    if (active) {
      return true
    } else return false
  })
  if (items.length > 0) {
    logger({ prefix: 'success', message: `Found ${items.length} active tasks` })
  }
  for (const item of items) {
    syncTodoDashboard(item)
  }
}
