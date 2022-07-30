import { SlashCommandBuilder } from '@discordjs/builders'
import { TextChannel } from 'discord.js'
import { Command, CommandFn } from '../commands'
import { discord } from '../connect'

const documentation = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return

  const content = `Pong`

  await interaction.reply({ content })
}

export const ping: Command = {
  documentation,
  controller,
}
