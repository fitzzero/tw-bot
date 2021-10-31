import { SlashCommandBuilder } from '@discordjs/builders'
import { Command, CommandFn } from '../commands'
import { wait } from '../../utility/wait'
import { discordAlert } from '../alert'

const documentation = new SlashCommandBuilder()
  .setName('alert')
  .addStringOption(option =>
    option.setName('message').setDescription('Alert message').setRequired(true)
  )
  .setDescription('Send alert message')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return
  const message = interaction.options.getString('message')
  if (!message) {
    await interaction.reply('Error with message')
    return
  }

  discordAlert({ message })

  await interaction.reply('Alert sent')
  await wait(5000)
  await interaction.deleteReply()
  return
}

export const alert: Command = {
  documentation,
  controller,
}
