import { alertCommand } from './discord/commands/alertTest'
import { ping } from './discord/commands/ping'
import { sync } from './discord/commands/sync'
import { todo } from './discord/commands/todo'
import { updateWorld } from './discord/commands/updateWorld'
import { DiscordConfig } from './types/config'

export const isDev = !!process.argv[2]

export const worldId = isDev ? 1 : 56

export const devDiscordConfig = {
  client: '896860363541348413',
  commands: [alertCommand, ping, todo, updateWorld, sync],
  guild: {
    id: '620484161974566922',
    alerts: '904963008525107250',
    dashboard: '904963008525107250',
    villages: '904963022089515090',
  },
}

export const prodDiscordConfig: DiscordConfig = {
  client: '896860363541348413',
  commands: [todo, updateWorld],
  guild: {
    id: '855057085719642134',
    alerts: '904407658558275636',
    dashboard: '904905248051720193',
    villages: '904407658558275636',
  },
}

export const discordConfig = (): DiscordConfig => {
  const config = isDev ? devDiscordConfig : prodDiscordConfig
  return config
}
