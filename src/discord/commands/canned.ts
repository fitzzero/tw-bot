import { ChatInputCommandInteraction } from 'discord.js'
import { wait } from '../../utility/wait'

export const closeCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  await interaction.editReply('Something went wrong, closing command...')
  await wait(7000)
  await interaction.deleteReply()
}
