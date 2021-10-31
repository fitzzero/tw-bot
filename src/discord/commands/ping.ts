import { SlashCommandBuilder } from '@discordjs/builders'
import { Command, CommandFn } from '../commands'
import { MessageActionRow, MessageButton } from 'discord.js'
import { wait } from '../../utility/wait'

const documentation = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return

  const content = `Pong`

  await interaction.reply({ content, components })
  await wait(5000)
  await interaction.editReply({ content, components: [] })
}

export const ping: Command = {
  documentation,
  controller,
}

const components = [
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('delete')
      .setLabel('Undo')
      .setStyle('DANGER')
  ),
]
