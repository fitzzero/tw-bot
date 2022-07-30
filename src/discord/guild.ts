import { Guild } from 'discord.js'
import { discordConfig } from '../config'
import { discordClient } from './connect'

export const getActiveGuild = async (): Promise<Guild | undefined> => {
  const guild = await discordClient.guilds.fetch(discordConfig().guild.id)
  return guild
}
