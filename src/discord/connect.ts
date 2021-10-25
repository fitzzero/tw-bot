/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Intents } from 'discord.js'
import { registerCommands } from './commands'

const token = process.env.WRTOKEN
const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS] } as any)

export const startDiscord = (dev?: boolean): void => {
  discordClient.login(token)
  registerCommands({ dev })
}

export const discord = discordClient
