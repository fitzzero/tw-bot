import { SlashCommandBuilder } from '@discordjs/builders'
import { Command, CommandFn } from './commands'

const documentation = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return
  await interaction.reply('Pong!')
}

export const ping: Command = {
  documentation,
  controller,
}
