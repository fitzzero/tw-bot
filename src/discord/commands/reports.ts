import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

import { Command } from '../commands'
import { closeCommand, parseInteractionCoordinates } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('reports')
  .addStringOption(option =>
    option
      .setName('coordinates')
      .setDescription('Coordinates of village (123|456)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('player')
      .setDescription('Coordinates of village (123|456)')
      .setRequired(false)
  )
  .setDescription('Get recent reports on village or player')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const village = await parseInteractionCoordinates({
    interaction,
    required: false,
  })
  const player = await parseInteractionCoordinates({
    interaction,
    required: false,
  })
  if (!village && !player) {
    closeCommand(interaction, 'Requires either a village or player')
    return
  }
  await interaction.editReply('wip')
  return
}

export const reports: Command = {
  documentation,
  controller,
}
