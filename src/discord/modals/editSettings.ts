import {
  ActionRowBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { settings } from '../../sheet/settings'
import { Modal } from '../modals'

const controller = async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply()
  await interaction.deleteReply()
}

export const modalBuilder = () => {
  const modal = new ModalBuilder()
    .setCustomId('dash-settings-modal')
    .setTitle('War Room Settings')

  const rows = [
    textRow('world', 'World short identifier (ie us60)'),
    textRow('startCoordinates', 'Starting coordinates'),
    textRow('playerRadius', 'Number of fields for player alerts'),
    textRow('barbRadius', 'Number of fields for barbarian alerts'),
  ]

  modal.addComponents(rows)
  return modal
}

const textRow = (settingId: string, label: string) => {
  const input: TextInputBuilder = new TextInputBuilder()
    .setCustomId(settingId)
    .setValue(settings.getSettingValue(settingId) || '')
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(4)

  return new ActionRowBuilder<TextInputBuilder>().addComponents(input)
}

export const settingsModal: Modal = {
  customId: 'dash-settings-modal',
  modalBuilder,
  controller,
}
