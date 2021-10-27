import { logger } from '../utility/logger'
import { activeCommands } from './commands'
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
    activeCommands.forEach(command => {
      if (interaction.commandName === command.documentation.name) {
        if (interaction.isCommand()) command.controller(interaction)
      }
    })
  })
}
