import { ButtonInteraction } from 'discord.js'
import { Button } from '../buttons'
import { closeCommand } from '../commands/canned'
import { settingsModal } from '../modals/editSettings'

const controller = async (interaction: ButtonInteraction) => {
  const modal = settingsModal.modalBuilder()
  if (!modal) {
    closeCommand(interaction)
    return
  }
  await interaction.showModal(modal)
}

export const settingsButton: Button = {
  customId: 'dash-settings',
  controller,
}
