import { MessageOptions } from 'discord.js'
import { WarRoomChannels } from '../sheet/channels'
import { messages } from '../sheet/messages'
import { logAlert, logger } from '../utility/logger'
import { onlineDashboard } from './dashboardMessages/online'
import { overviewDashboard } from './dashboardMessages/overview'

export interface DashboardMessage {
  id: string
  getPayload: () => MessageOptions
}

const activeDashboards: DashboardMessage[] = [
  overviewDashboard,
  onlineDashboard,
]

export const syncDashboard = async (single?: DashboardMessage) => {
  let success = true
  if (single) {
    success = await messages.syncMessage({
      id: single.id,
      channelId: WarRoomChannels.dash,
      payload: single.getPayload(),
    })
  } else {
    for (const dashboard of activeDashboards) {
      success = await messages.syncMessage({
        id: dashboard.id,
        channelId: WarRoomChannels.dash,
        payload: dashboard.getPayload(),
      })
    }
  }
  if (success) {
    logger({ message: 'Discord: Synced dashboard messages', prefix: 'success' })
  } else logAlert('Discord: Something went wrong syncing dashboard messages ')
}
