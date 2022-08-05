import { ChatInputCommandInteraction } from 'discord.js'
import { wait } from '../../utility/wait'

export const closeCommand = async (
  interaction: ChatInputCommandInteraction,
  message = 'Something went wrong, closing command...'
) => {
  await interaction.editReply(message)
  await wait(7000)
  await interaction.deleteReply()
}
