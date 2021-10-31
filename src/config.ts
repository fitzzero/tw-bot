import { ping } from './discord/ping'
import { todo } from './discord/todo'
import { updateWorld } from './discord/updateWorld'
import { DiscordConfig } from './types/config'

export const isDev = !!process.argv[2]

export const worldId = isDev ? 1 : 56

export const devDiscordConfig = {
  client: '896860363541348413',
  commands: [ping, todo, updateWorld],
  guild: {
    id: '620484161974566922',
    alerts: '620484161974566922',
  },
}

export const prodDiscordConfig: DiscordConfig = {
  client: '896860363541348413',
  commands: [],
  guild: {
    id: '855057085719642134',
    alerts: '891367656907743232',
  },
}

export const discordConfig = isDev ? devDiscordConfig : prodDiscordConfig
