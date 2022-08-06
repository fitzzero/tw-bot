import { MessageOptions } from 'discord.js'
import { WRChannels } from '../sheet/channels'
import { messages } from '../sheet/messages'
import { logAlert, logger } from '../utility/logger'
import { availableDashboard } from './dashboardMessages/available'
import { onlineDashboard } from './dashboardMessages/online'
import { overviewDashboard } from './dashboardMessages/overview'

export interface DashboardMessage {
  id: string
  getPayload: () => MessageOptions | undefined
  channel: WRChannels
  rebuild?: boolean
}

const activeDashboards: DashboardMessage[] = [
  overviewDashboard,
  onlineDashboard,
  availableDashboard,
]

export const syncDashboard = async (single?: DashboardMessage) => {
  let success = true
  if (single) {
    const payload = single.getPayload()
    if (!payload) {
      await messages.deleteMessage(single.id)
      return
    }
    const handleFn = single.rebuild
      ? messages.rebuildMessage
      : messages.syncMessage
    success = await handleFn({
      id: single.id,
      channelId: single.channel,
      payload: payload,
    })
  } else {
    for (const dashboard of activeDashboards) {
      const payload = dashboard.getPayload()
      if (!payload) {
        await messages.deleteMessage(dashboard.id)
        return
      }
      const handleFn = dashboard.rebuild
        ? messages.rebuildMessage
        : messages.syncMessage
      success = await handleFn({
        id: dashboard.id,
        channelId: dashboard.channel,
        payload: payload,
      })
    }
  }
  if (success) {
    logger({ message: 'Discord: Synced dashboard messages', prefix: 'success' })
  } else logAlert('Discord: Something went wrong syncing dashboard messages ')
}
