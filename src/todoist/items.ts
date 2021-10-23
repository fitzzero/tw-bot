import moment from 'moment-timezone'
import { Project } from 'todoist/dist/v8-types'
import { withinLastMinute } from '../utility/time'
import { todoist } from './connect'

export const syncItems = async (project: Project): Promise<void> => {
  if (!todoist) return

  const items = todoist.items.get().filter(item => {
    const due = moment.tz(item?.due?.date, 'America/New_York')
    if (!due) return false
    const active = withinLastMinute(due)
    console.log(active)
    if (item.project_id === project.id && active) {
      return true
    } else return false
  })

  console.log(items)
}
