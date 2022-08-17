import { ButtonInteraction } from 'discord.js'
import { Button } from '../buttons'
import { closeCommand } from '../commands/canned'
import { alertsModal } from '../modals/editAlerts'

const controller = async (interaction: ButtonInteraction) => {
  const modal = alertsModal.modalBuilder()
  if (!modal) {
    closeCommand(interaction)
    return
  }
  await interaction.showModal(modal)
}

export const alertsButton: Button = {
  customId: 'dash-alerts',
  controller,
}
