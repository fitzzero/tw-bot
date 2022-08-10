import { ButtonInteraction } from 'discord.js'
import { Button } from '../buttons'
import { closeCommand } from '../commands/canned'
import { incomingModal } from '../modals/editIncoming'

const controller = async (interaction: ButtonInteraction) => {
  const modal = incomingModal.modalBuilder(interaction)
  if (!modal) {
    closeCommand(interaction)
    return
  }
  await interaction.showModal(modal)
}

export const incomingButton: Button = {
  customId: 'incoming-origin',
  controller,
}
