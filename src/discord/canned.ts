import { CommandInteraction } from 'discord.js'
import { PromiseFn } from '../types/methods'

const requiresAdmin: PromiseFn<CommandInteraction, void> =
  async interaction => {
    interaction.reply({ content: 'Requires Admin', ephemeral: true })
    return
  }

const error: PromiseFn<CommandInteraction, void> = async interaction => {
  interaction.reply({ content: 'Something went wrong :(', ephemeral: true })
  return
}

export const cannedResponses = {
  requiresAdmin,
  error,
}
