import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { Command } from '../commands'
import { minToDuration } from '../../utility/time'

const documentation = new SlashCommandBuilder()
  .setName('online')
  .setDescription(`See how long you've been online`)

const controller = async (interaction: CommandInteraction) => {
  await interaction.deferReply()

  const account = accounts.getById(interaction.user.id)

  if (!account) {
    await interaction.editReply({ content: 'Discord account not found' })
    return
  }

  const minutes = parseInt(account.minutesActive)
  const duration = minToDuration(minutes)

  await interaction.editReply({
    content: `Your online time: ${duration}`,
  })
}

export const online: Command = {
  documentation,
  controller,
}
