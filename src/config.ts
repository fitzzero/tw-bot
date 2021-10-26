import { DiscordConfig } from './types/config'

export const isDev = !!process.argv[2]

export const testWorldId = 1
export const prodWorldId = 55

export const discordConfig: DiscordConfig = {
  client: '896860363541348413',
  guild: '855057085719642134',
  testGuild: '620484161974566922',
}
