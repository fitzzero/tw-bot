import { keys } from 'ts-transformer-keys'
import { getActiveCategory, getActiveGuild } from '../discord/guild'
import { logger } from '../utility/logger'
import { RowStructure, SheetData } from './sheetData'

export interface ChannelData extends RowStructure {
  id: string
  channelId: string
}

const headers = keys<ChannelData>().map(key => key.toString())

const initialChannels = [
  { id: 'dashboard', topic: 'War Room Command Center' },
  { id: 'news-feed', topic: 'War Room Updates' },
  { id: 'todo', topic: 'War Room Todo' },
]

class Channels extends SheetData<ChannelData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  createChannel = async ({ id, topic }: { id: string; topic: string }) => {
    const category = await getActiveCategory()
    if (!category) return
    const channel = await category.children.create({
      name: id,
      topic,
    })
    if (!channel) return
    const added = await this.add({
      id,
      channelId: channel.id,
    })
    // If successfully created and synced data
    if (added) return channel
    // Clean up discord if data issue
    else {
      channel.delete()
      return
    }
  }

  syncChannels = async () => {
    let success = true
    const guild = await getActiveGuild()
    // For each default channel
    for (const channel of initialChannels) {
      const channelData = this.getById(channel.id)
      // If saved, check if it exists
      if (channelData) {
        const existingChannel = await guild.channels.fetch(
          channelData.channelId
        )
        // If not found attempt to re-create
        if (!existingChannel) {
          success = !!(await this.createChannel(channel))
        }
      }
      // Else create new channel
      else {
        success = !!(await this.createChannel(channel))
      }
    }
    if (success) {
      logger({ message: 'Discord: Synced channels', prefix: 'success' })
    } else {
      logger({
        message: 'Discord: Something went wrong syncing channels',
        prefix: 'alert',
      })
    }
  }
}

export const channels = new Channels('channels', headers)
