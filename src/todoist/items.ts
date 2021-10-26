import moment from 'moment-timezone'
import { Item } from 'todoist/dist/v8-types'
import { logger } from '../utility/logger'
import { withinLastMinute } from '../utility/time'
import { todoist } from './connect'
import { ProjectFn } from './project'

let itemsInMemory: Item[] | undefined = undefined

export const getActiveItems = (): Item[] | undefined => itemsInMemory

export const syncItems: ProjectFn = async ({ project }) => {
  if (!todoist) return

  itemsInMemory = todoist.items.get()

  // Get items due this minute
  const items = itemsInMemory.filter(item => {
    const due = moment.tz(item?.due?.date, 'America/New_York')
    if (!due) return false
    const active = withinLastMinute(due)
    if (item.project_id === project.id && active) {
      return true
    } else return false
  })
  if (items.length > 0) {
    logger({ prefix: 'success', message: `Found ${items.length} active tasks` })
  }
}
