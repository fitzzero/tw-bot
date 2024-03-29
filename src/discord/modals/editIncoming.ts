import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { IncomingData, incomings } from '../../sheet/incomings'
import { messages } from '../../sheet/messages'
import { closeCommand } from '../commands/canned'
import { syncIncomingDashboard } from '../dashboardMessages/incoming'
import { Modal } from '../modals'

const controller = async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply()
  const targetId = interaction.customId.split('-')[2]
  const idx = interaction.customId.split('-')[3]
  if (!targetId || !idx) {
    closeCommand(interaction)
    return
  }
  const villageIncomings = incomings.getIncomingsByCoords(targetId, idx)
  if (!villageIncomings) {
    closeCommand(interaction)
    return
  }

  for (const incoming of villageIncomings) {
    const newOrigin = interaction.fields.getTextInputValue(incoming.id)
    if (!newOrigin) continue
    incoming.origin = newOrigin
    await incomings.update(incoming)
  }

  await syncIncomingDashboard({
    coords: targetId,
  })

  await interaction.deleteReply()
}

export const modalBuilder = (interaction: ButtonInteraction) => {
  const message = messages.getByProperty('messageId', interaction.message.id)
  const targetId = message?.id?.split('-')[1]
  if (!targetId) return

  const villageIncomings = incomings.getIncomingsByCoords(
    targetId,
    message.options
  )

  if (!villageIncomings) return
  const modal = new ModalBuilder()
    .setCustomId(`edit-incoming-${targetId}-${message.options}`)
    .setTitle('Manage Incoming Origins')

  const rows = []

  for (const incoming of villageIncomings) {
    rows.push(textRow(incoming))
  }

  modal.addComponents(rows)
  return modal
}

const textRow = ({ id, arrival, origin }: IncomingData) => {
  const input: TextInputBuilder = new TextInputBuilder()
    .setCustomId(id)
    .setValue(origin)
    .setLabel(`-> ${arrival}`)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(7)
  return new ActionRowBuilder<TextInputBuilder>().addComponents(input)
}

export const incomingModal: Modal = {
  customId: 'edit-incoming-',
  modalBuilder,
  controller,
}
