import { Guild } from 'discord.js'
import { discordConfig } from '../config'
import { discord } from './connect'

export const getActiveGuild = async (): Promise<Guild | undefined> => {
  const guild = await discord.guilds.fetch(discordConfig().guild.id)
  return guild
}
