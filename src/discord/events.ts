import { logger } from '../utility/logger'
import { discord } from './connect'

export const DiscordEvents = (): void => {
  discord.on('ready', () => {
    logger({
      prefix: 'success',
      message: `Discord: Connected as ${discord.user?.username}`,
    })
  })

  discord.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName === 'ping') {
      logger({ prefix: 'success', message: 'Created Command' })
      await interaction.reply('Pong!')
    }
  })
}
