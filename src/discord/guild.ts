import { CategoryChannel, ChannelType, Guild } from 'discord.js'
import { botConfig } from '../config'
import { logAlert } from '../utility/logger'
import { discordClient } from './connect'

let guild: Guild | undefined = undefined
let category: CategoryChannel | undefined = undefined

export const getActiveGuild = async () => {
  if (guild) return guild
  else {
    guild = await discordClient.guilds.fetch(botConfig.guild)
    return guild
  }
}

export const getActiveCategory = async () => {
  if (!guild) guild = await getActiveGuild()
  if (!category) {
    const channel = await guild.channels.fetch(botConfig.category)
    if (channel?.type === ChannelType.GuildCategory) {
      category = channel
      return category
    } else {
      logAlert(`Couldn't find War Room Category Channel`, 'Discord')
    }
  }
  return category
}
