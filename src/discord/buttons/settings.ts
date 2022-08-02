import { ButtonInteraction } from 'discord.js'
import { Button } from '../buttons'
import { settingsModal } from '../modals/editSettings'

const controller = async (interaction: ButtonInteraction) => {
  const modal = settingsModal.modalBuilder()
  await interaction.showModal(modal)
}

export const settingsButton: Button = {
  customId: 'dash-settings',
  controller,
}
