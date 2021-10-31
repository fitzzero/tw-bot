import { alert } from './discord/commands/alert'
import { ping } from './discord/commands/ping'
import { todo } from './discord/commands/todo'
import { updateWorld } from './discord/commands/updateWorld'
import { DiscordConfig } from './types/config'

export const isDev = !!process.argv[2]

export const worldId = isDev ? 1 : 56

export const devDiscordConfig = {
  client: '896860363541348413',
  commands: [alert, ping, todo, updateWorld],
  guild: {
    id: '620484161974566922',
    alerts: '637708987239890964',
  },
}

export const prodDiscordConfig: DiscordConfig = {
  client: '896860363541348413',
  commands: [todo, updateWorld],
  guild: {
    id: '855057085719642134',
    alerts: '891367656907743232',
  },
}

export const discordConfig = isDev ? devDiscordConfig : prodDiscordConfig
