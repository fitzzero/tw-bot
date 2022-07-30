import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { discordConfig } from '../config'
import { logger } from '../utility/logger'
import { activeCommands } from './commands'
import { discordClient as discord } from './connect'

export const DiscordEvents = () => {
  discord.on('ready', () => {
    logger({
      prefix: 'success',
      message: `Discord: Connected as ${discord.user?.username}`,
    })
    // TODO: Load Active Channels/Threads/Messages?
  })

  try {
    discord.on('interactionCreate', interaction => {
      if (interaction.guildId != discordConfig().guild.id) return
      if (interaction.isCommand()) {
        handleCommand(interaction)
      }
      if (interaction.isButton()) {
        handleButton(interaction)
      }
    })
  } catch (err) {
    logger({
      prefix: 'alert',
      message: `Discord:\n ${err}`,
    })
  }
}

const handleCommand = (interaction: CommandInteraction) => {
  activeCommands().forEach(command => {
    if (interaction.commandName === command.documentation.name) {
      if (interaction.isCommand()) command.controller(interaction)
    }
  })
}

const handleButton = (interaction: ButtonInteraction) => {}
