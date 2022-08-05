import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

import { Command } from '../commands'
import { closeCommand } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('village')
  .addStringOption(option =>
    option
      .setName('coords')
      .setDescription('Coords of village (123|456)')
      .setRequired(true)
  )
  .setDescription('Get village info')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return

  closeCommand(interaction)
}

export const village: Command = {
  documentation,
  controller,
}
