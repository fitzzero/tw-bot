import { TextChannel } from 'discord.js'
import { discordConfig } from '../config'
import { PromiseFn } from '../types/methods'
import { logger } from '../utility/logger'
import { getActiveGuild } from './guild'

let channel: TextChannel | undefined = undefined

export const getDashboardChannel: PromiseFn<void, TextChannel | undefined> =
  async () => {
    if (channel) {
      return channel
    }

    try {
      const guild = await getActiveGuild()
      const channelId = discordConfig().guild.dashboard
      const someChannel = await guild?.channels.fetch(channelId)
      if (someChannel?.isText) {
        channel = someChannel as TextChannel
      }
    } catch (err) {
      logger({ prefix: 'alert', message: `Discord: ${err}` })
    }

    return channel
  }
