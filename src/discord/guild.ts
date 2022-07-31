import { Guild } from 'discord.js'
import { botConfig } from '../config'
import { discordClient } from './connect'

export const getActiveGuild = async (): Promise<Guild | undefined> => {
  const guild = await discordClient.guilds.fetch(botConfig.guild)
  return guild
}
