import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { TWUnits } from '../../sheet/units'

import { Command } from '../commands'
import { getDiscordEmoji } from '../guild'
import { closeCommand } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('noble')
  .addStringOption(option =>
    option
      .setName('amount')
      .setDescription('Optional: How many nobles')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('loyalty')
      .setDescription('Optional: Starting Loyalty')
      .setRequired(false)
  )
  .setDescription('Simulate noble hits')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const amount = parseInt(interaction.options.getString('amount') || '1')
  let loyalty = parseInt(interaction.options.getString('loyalty') || '100')
  if (!amount) {
    closeCommand(interaction)
    return
  }
  const emoji = await getDiscordEmoji(TWUnits.snob)
  let content = ''

  for (let i = 0; i < amount; i++) {
    const hit = Math.floor(Math.random() * 16) + 20
    const newLoyalty = loyalty - hit
    if (i > 0) content += `\n`
    content += `${emoji} ~~${loyalty}~~ -> **${newLoyalty}** (${hit})`
    loyalty = newLoyalty
  }

  await interaction.editReply(content)

  return
}

export const noble: Command = {
  documentation,
  controller,
}
