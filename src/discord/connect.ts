import { Client, GatewayIntentBits as Intents } from 'discord.js'
import { logAlert } from '../utility/logger'

const token = process.env.WRTOKEN
export const discordClient = new Client({ intents: [Intents.Guilds] } as any)

export const startDiscord = (): void => {
  try {
    discordClient.login(token)
  } catch (err) {
    logAlert(err, 'Discord Login')
  }
}
