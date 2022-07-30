import { CommandInteraction } from 'discord.js'

const requiresAdmin = async (interaction: CommandInteraction) => {
  interaction.reply({ content: 'Requires Admin', ephemeral: true })
  return
}

const error = async (interaction: CommandInteraction) => {
  interaction.reply({ content: 'Something went wrong :(', ephemeral: true })
  return
}

const loading = async (interaction: CommandInteraction) => {
  interaction.reply({ content: 'Loading...' })
  return
}

export const cannedResponses = {
  requiresAdmin,
  error,
  loading,
}
