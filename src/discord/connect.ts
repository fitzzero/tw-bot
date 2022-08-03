import { Client, GatewayIntentBits as Intents } from 'discord.js'
import { registerCommands } from './commands'

const token = process.env.WRTOKEN
export const discordClient = new Client({ intents: [Intents.Guilds] } as any)

export const startDiscord = (): void => {
  discordClient.login(token)
  registerCommands()
}
