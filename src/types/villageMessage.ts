import { Snowflake } from 'discord-api-types'

export interface VillageMessage {
  villageId: string | Snowflake
  channelId: string | Snowflake
  messageId: string | Snowflake
}
