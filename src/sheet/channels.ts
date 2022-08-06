import { ChannelType, MessageOptions } from 'discord.js'
import { keys } from 'ts-transformer-keys'
import { getActiveCategory, getActiveGuild } from '../discord/guild'
import { logAlert, logger } from '../utility/logger'
import { RowStructure, SheetData } from './sheetData'

export interface ChannelData extends RowStructure {
  id: string
  channelId: string
}

export interface CreateChannelProps {
  id: string
  topic: string
}

const headers = keys<ChannelData>().map(key => key.toString())

export const enum WRChannels {
  dash = 'dashboard',
  news = 'news-feed',
  todo = 'todo',
}

const initialChannels: CreateChannelProps[] = [
  { id: WRChannels.dash, topic: 'War Room Command Center' },
  { id: WRChannels.news, topic: 'War Room Updates' },
  { id: WRChannels.todo, topic: 'War Room Todo' },
]

class Channels extends SheetData<ChannelData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  createChannel = async ({ id, topic }: CreateChannelProps) => {
    const category = await getActiveCategory()
    if (!category) return
    try {
      const channel = await category.children.create({
        name: id,
        topic,
      })
      if (!channel) return
      const added = await this.updateOrAdd({
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
    } catch (err) {
      logAlert(err, 'Discord')
      return
    }
  }

  getDiscordChannelById = async (id: string) => {
    const guild = await getActiveGuild()
    const channelData = this.getById(id)
    if (!channelData || !guild) return
    try {
      const channel = await guild.channels.fetch(channelData.channelId)
      if (channel?.type == ChannelType.GuildText) {
        return channel
      }
    } catch (err) {}
    logAlert(`Failed to find channel ${id}`, 'Discord')
    return
  }

  sendMessage = async (id: string, options: MessageOptions) => {
    let discordChannel = await this.getDiscordChannelById(id)
    if (!discordChannel) return false
    try {
      return !!discordChannel.send(options)
    } catch (err) {
      logAlert(err, 'Discord')
      return
    }
  }

  syncChannels = async () => {
    let success = true
    // For each default channel
    for (const channelData of initialChannels) {
      const existingChannel = await this.getDiscordChannelById(channelData.id)
      // If not found attempt to re-create
      if (!existingChannel) {
        success = !!(await this.createChannel(channelData))
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
