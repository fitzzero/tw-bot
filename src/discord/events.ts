import {
  ButtonInteraction,
  CommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js'
import { botConfig, publicConfig } from '../config'
import { logAlert, logger } from '../utility/logger'
import { activeButtons } from './buttons'
import { activeCommands, publicCommands } from './commands'
import { discordClient as discord } from './connect'
import { activeModals } from './modals'

const approvedGuilds = [botConfig.guild].concat(publicConfig.guilds)

export const DiscordEvents = () => {
  discord.on('ready', () => {
    logger({
      prefix: 'success',
      message: `Discord: Connected as ${discord.user?.username}`,
    })
  })

  try {
    discord.on('interactionCreate', interaction => {
      if (!interaction.guildId) return
      if (!approvedGuilds.includes(interaction.guildId)) return
      const isPublic = publicConfig.guilds.includes(interaction.guildId)

      if (interaction.isCommand()) {
        handleCommand(interaction, isPublic)
      }
      if (interaction.isButton()) {
        handleButton(interaction)
      }
      if (interaction.isModalSubmit()) {
        handleModalSubmit(interaction)
      }
    })
  } catch (err) {
    logger({
      prefix: 'alert',
      message: `Discord:\n ${err}`,
    })
  }
}

const handleCommand = (interaction: CommandInteraction, isPublic: boolean) => {
  const commands = isPublic ? publicCommands() : activeCommands()
  commands.forEach(command => {
    if (interaction.commandName === command.documentation.name) {
      command.controller(interaction)
    }
  })
}

const handleButton = (interaction: ButtonInteraction) => {
  activeButtons.forEach(button => {
    if (interaction.customId.includes(button.customId)) {
      try {
        button.controller(interaction)
      } catch (err) {
        logAlert(err, 'Discord Button')
      }
    }
  })
}

const handleModalSubmit = (interaction: ModalSubmitInteraction) => {
  activeModals.forEach(modal => {
    if (interaction.customId.includes(modal.customId)) {
      try {
        modal.controller(interaction)
      } catch (err) {
        logAlert(err, 'Discord Button')
      }
    }
  })
}
