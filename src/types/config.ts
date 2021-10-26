import { Snowflake } from 'discord.js'

export interface DiscordConfig {
  client: Snowflake
  guild: Snowflake
  testGuild: Snowflake
}
