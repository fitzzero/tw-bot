import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { tribes } from '../../sheet/tribes'
import { Command } from '../commands'
import { tribeMessage } from '../messages/tribe'
import { closeCommand } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('tribe')
  .addStringOption(option =>
    option.setName('tag').setDescription('The tribe tag').setRequired(true)
  )
  .setDescription('Get tribe info and options')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()

  // Make sure tag finds tribe
  const tag = interaction.options.getString('tag')
  if (!tag) {
    await closeCommand(interaction)
    return
  }
  const tribe = tribes.getByProperty('tag', tag)
  if (!tribe) {
    await closeCommand(interaction, `Tribe with tag ${tag} not found`)
    return
  }

  // Build response payload
  const payload = await tribeMessage({ tribe })

  await interaction.editReply(payload)
  return
}

export const tribe: Command = {
  documentation,
  controller,
}
