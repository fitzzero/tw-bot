import {
  APIMessageComponentEmoji,
  CategoryChannel,
  ChannelType,
  Guild,
} from 'discord.js'
import { botConfig } from '../config'
import { logAlert } from '../utility/logger'
import { discordClient } from './connect'

let coreGuild: Guild | undefined = undefined
let guild: Guild | undefined = undefined
let category: CategoryChannel | undefined = undefined

export const enum WREmojis {
  bell = 'bell',
  complete = 'complete',
  delete = 'delete',
  drive = 'drive',
  edit = 'edit',
  map = 'map',
  refresh = 'refresh',
}

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

export const getCoreGuild = async () => {
  if (coreGuild) return coreGuild
  else {
    guild = await discordClient.guilds.fetch(botConfig.coreGuild)
    return guild
  }
}

export const getDiscordEmoji = async (id: string) => {
  const guild = await getCoreGuild()
  const emoji = guild.emojis.cache.find(emoji => emoji.name == id)
  if (!emoji) {
    logAlert(`Couldn't find ${id} Discord Emoji`, 'Units')
    return
  }
  return emoji
}

export const getDiscordComponentEmoji = async (id?: string) => {
  if (!id) return
  const emoji = await getDiscordEmoji(id)
  if (!emoji) return

  const componentEmoji: APIMessageComponentEmoji = {
    id: emoji.id,
    animated: emoji.animated || false,
    name: emoji.name || '',
  }

  return componentEmoji
}
