import { MessageOptions } from 'discord.js'
import { WRChannels } from '../sheet/channels'
import { messages } from '../sheet/messages'
import { logAlert, logger } from '../utility/logger'
import { availableDashboard } from './dashboardMessages/available'
import { onlineDashboard } from './dashboardMessages/online'
import { overviewDashboard } from './dashboardMessages/overview'

export interface DashboardMessage {
  id: string
  getPayload(): Promise<MessageOptions | undefined>
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
    const payload = await single.getPayload()
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
      const payload = await dashboard.getPayload()
      if (!payload) {
        await messages.deleteMessage(dashboard.id)
      } else {
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
  }
  if (success) {
    logger({
      message: `Discord: Synced ${
        single ? single.id : 'all'
      } dashboard messages`,
      prefix: 'success',
    })
  } else logAlert('Discord: Something went wrong syncing dashboard messages ')
}
