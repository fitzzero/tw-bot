import { ButtonInteraction } from 'discord.js'
import { messages } from '../../sheet/messages'
import { Button } from '../buttons'
import { closeCommand } from '../commands/canned'
import { syncIncomingDashboard } from '../dashboardMessages/incoming'
import { incomingModal } from '../modals/editIncoming'

const originController = async (interaction: ButtonInteraction) => {
  const modal = incomingModal.modalBuilder(interaction)
  if (!modal) {
    closeCommand(interaction)
    return
  }
  await interaction.showModal(modal)
}

const idxController = async (interaction: ButtonInteraction) => {
  await interaction.deferReply()
  const action = interaction.customId.split('-')[2]
  const message = messages.getByProperty('messageId', interaction.message.id)
  const targetId = message?.id?.split('-')[1]
  if (!action || !message || !targetId) {
    closeCommand(interaction)
    return
  }
  let idx = parseInt(message.options)
  if (action === 'decrease') {
    idx--
  }
  if (action === 'increase') {
    idx++
  }
  await syncIncomingDashboard({
    coords: targetId,
    changes: true,
    idx: `${idx}`,
  })
  await interaction.deleteReply()
}

export const incomingButtonOrigin: Button = {
  customId: 'incoming-origin',
  controller: originController,
}

export const incomingButtonIdx: Button = {
  customId: 'incoming-idx',
  controller: idxController,
}
