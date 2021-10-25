import { Snowflake } from 'discord.js'

export const activeWorlds = [55]

interface DiscordConfig {
  client: Snowflake
  guild: Snowflake
  testGuild: Snowflake
}

export const discordConfig: DiscordConfig = {
  client: '896860363541348413',
  guild: '855057085719642134',
  testGuild: '620484161974566922',
}
