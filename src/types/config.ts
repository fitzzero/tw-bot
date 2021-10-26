import { Command } from '../discord/commands'

export interface DiscordConfig {
  client: string
  commands: Command[]
  guild: {
    id: string
    todo: string
  }
}
