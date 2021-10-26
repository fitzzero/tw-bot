import { ping } from './discord/ping'
import { todo } from './discord/todo'
import { DiscordConfig } from './types/config'

export const isDev = !!process.argv[2]

export const worldId = isDev ? 1 : 55

export const devDiscordConfig = {
  client: '896860363541348413',
  commands: [ping, todo],
  guild: {
    id: '620484161974566922',
    todo: '',
  },
}

export const prodDiscordConfig: DiscordConfig = {
  client: '896860363541348413',
  commands: [],
  guild: {
    id: '855057085719642134',
    todo: '',
  },
}

export const discordConfig = isDev ? devDiscordConfig : prodDiscordConfig
