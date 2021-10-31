import { Guild } from 'discord.js'
import { discordConfig } from '../config'
import { discord } from './connect'

let guild: Guild | undefined = undefined

export const getActiveGuild = async (): Promise<Guild | undefined> => {
  if (!guild) {
    guild = await discord.guilds.fetch(discordConfig.guild.id)
  }
  return guild
}
