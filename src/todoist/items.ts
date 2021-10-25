import moment from 'moment-timezone'
import { withinLastMinute } from '../utility/time'
import { todoist } from './connect'
import { ProjectFn } from './project'

export const syncItems: ProjectFn = async ({ project }) => {
  if (!todoist) return

  // Get items due this minute
  const items = todoist.items.get().filter(item => {
    const due = moment.tz(item?.due?.date, 'America/New_York')
    if (!due) return false
    const active = withinLastMinute(due)
    if (item.project_id === project.id && active) {
      return true
    } else return false
  })
  console.log('found items: ', items.length)
}
