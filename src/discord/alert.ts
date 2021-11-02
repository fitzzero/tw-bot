import { TextChannel } from 'discord.js'
import { discordConfig } from '../config'
import { PromiseFn } from '../types/methods'
import { logger } from '../utility/logger'
import { getActiveGuild } from './guild'

let channel: TextChannel | undefined = undefined

export interface DiscordAlertProps {
  message: string
}

export const getChannel = async (): Promise<void> => {
  try {
    const guild = await getActiveGuild()
    const channelId = discordConfig().guild.alerts
    const someChannel = await guild?.channels.fetch(channelId)
    if (someChannel?.isText) {
      channel = someChannel as TextChannel
    }
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `Discord: ${err}` })
  }
}

export const discordAlert: PromiseFn<DiscordAlertProps, void> = async ({
  message,
}) => {
  if (!channel) {
    await getChannel()
  }
  if (!channel) {
    logger({ prefix: 'alert', message: `Discord: Couldn't load alert channel` })
    return
  }

  channel?.send(message)
}
