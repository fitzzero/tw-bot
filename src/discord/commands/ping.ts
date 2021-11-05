import { SlashCommandBuilder } from '@discordjs/builders'
import { TextChannel } from 'discord.js'
import { Command, CommandFn } from '../commands'
import { discord } from '../connect'

const documentation = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return

  const guild = await discord.guilds.fetch('855057085719642134')
  const channel = (await guild.channels.fetch(
    '904407658558275636'
  )) as TextChannel
  const message = await channel.messages.fetch('906056137198161921')
  await message.delete()

  const content = `Pong`

  await interaction.reply({ content })
}

export const ping: Command = {
  documentation,
  controller,
}
