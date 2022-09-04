import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

import { Command } from '../commands'
import { villageMessage } from '../messages/village'
import { parseInteractionCoordinates } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('village')
  .addStringOption(option =>
    option
      .setName('coordinates')
      .setDescription('Coordinates of village (123|456)')
      .setRequired(true)
  )
  .setDescription('Get village info')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const village = await parseInteractionCoordinates({ interaction })
  if (!village) return
  const message = villageMessage({ village, showReports: true })
  await interaction.editReply(message)
  return
}

export const village: Command = {
  documentation,
  controller,
}
