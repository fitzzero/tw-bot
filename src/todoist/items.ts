import moment from 'moment-timezone'
import { Item } from 'todoist/dist/v8-types'
import { ItemData } from '../@types/item'
import { getTodoPayload } from '../discord/dashboardMessages/todo'
import { messages } from '../sheet/messages'
import { logAlert, logger } from '../utility/logger'
import { momentUtcOffset, withinLastMinute } from '../utility/time'
import { todoist } from './connect'
import { getActiveProject } from './project'

let itemsInMemory: Item[] | undefined = undefined

export const getActiveItems = (): Item[] | undefined => itemsInMemory

export const getItemById = (id: string) => {
  if (!todoist) return
  loadItems()
  if (!itemsInMemory) return

  return itemsInMemory.find(item => item.id.toString() == id)
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
    if (item.project_id != project.id || item.is_deleted) return
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
    const messageData = messages.getById(`todo-${item.id}`)
    if (messageData) {
      await messages.rebuildMessage({
        id: messageData.id,
        channelId: messageData.channelId,
        payload: getTodoPayload({ item }),
      })
    }
  }
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
