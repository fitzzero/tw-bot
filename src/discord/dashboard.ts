import { MessageOptions } from 'discord.js'
import { WarRoomChannels } from '../sheet/channels'
import { messages } from '../sheet/messages'
import { logAlert, logger } from '../utility/logger'
import { overviewDashboard } from './dashboardMessages/overview'

export interface DashboardMessages {
  id: string
  getPayload: () => MessageOptions
}

const activeDashboards: DashboardMessages[] = [overviewDashboard]

export const syncDashboard = async () => {
  let success = true
  for (const dashboard of activeDashboards) {
    success = await messages.syncMessage({
      id: dashboard.id,
      channelId: WarRoomChannels.dash,
      payload: dashboard.getPayload(),
    })
  }
  if (success) {
    logger({ message: 'Discord: Synced dashboard messages', prefix: 'success' })
  } else logAlert('Discord: Something went wrong syncing dashboard messages ')
}
