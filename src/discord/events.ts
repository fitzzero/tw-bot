import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { discordConfig } from '../config'
import { Fn } from '../@types/methods'
import { logger } from '../utility/logger'
import {
  activeButtonIds,
  handleActiveInteraction,
  loadActiveMessage,
} from './active'
import { activeCommands } from './commands'
import { discord } from './connect'
import { tryCatch } from '../utility/try'

export const DiscordEvents = (): void => {
  discord.on('ready', () => {
    logger({
      prefix: 'success',
      message: `Discord: Connected as ${discord.user?.username}`,
    })
    loadActiveMessage()
  })

  discord.on('interactionCreate', async interaction => {
    if (interaction.guildId != discordConfig().guild.id) return
    if (interaction.isCommand()) {
      tryCatch({
        tryFn: () => handleCommand(interaction),
        name: 'Discord Interaction',
      })
    }
    if (interaction.isButton()) {
      tryCatch({
        tryFn: () => handleButton(interaction),
        name: 'Discord Interaction',
      })
    }
  })
}

const handleCommand: Fn<CommandInteraction, void> = interaction => {
  activeCommands().forEach(command => {
    if (interaction.commandName === command.documentation.name) {
      if (interaction.isCommand()) command.controller(interaction)
    }
  })
}

const handleButton: Fn<ButtonInteraction, void> = interaction => {
  if (activeButtonIds.includes(interaction.customId)) {
    handleActiveInteraction(interaction)
  }
}
