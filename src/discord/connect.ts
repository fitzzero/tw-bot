/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, GatewayIntentBits as Intents } from 'discord.js'
import { registerCommands } from './commands'

const token = process.env.WRTOKEN
const discordClient = new Client({ intents: [Intents.Guilds] } as any)

export const startDiscord = (): void => {
  discordClient.login(token)
  registerCommands()
}

export const discord = discordClient
