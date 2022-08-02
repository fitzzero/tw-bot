import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Command } from '../commands'

const documentation = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return

  const content = `Pong`

  await interaction.reply({ content })
}

export const ping: Command = {
  documentation,
  controller,
}
