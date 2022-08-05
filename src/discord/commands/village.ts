import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { splitCoords, villages } from '../../sheet/villages'

import { Command } from '../commands'
import { villageMessage } from '../messages/village'
import { closeCommand } from './canned'

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
  const coords = interaction.options.getString('coordinates')
  if (coords == null) {
    closeCommand(interaction, 'Coordinates missing')
    return
  }
  const coordsSplit = splitCoords(coords)
  if (!coordsSplit) {
    closeCommand(interaction, 'Issue parsing coordinates, closing command')
    return
  }

  const village = villages.getByCoords(coordsSplit)
  if (!village) {
    closeCommand(interaction, 'Village not found')
    return
  }
  const message = villageMessage(village)
  await interaction.editReply(message)
  return
}

export const village: Command = {
  documentation,
  controller,
}
