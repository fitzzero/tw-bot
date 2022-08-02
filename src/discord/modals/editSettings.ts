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
  await interaction.deferReply({ ephemeral: true })
  await interaction.deleteReply()
}

export const modalBuilder = () => {
  const modal = new ModalBuilder()
    .setCustomId('dash-settings-modal')
    .setTitle('War Room Settings')

  const rows = [
    textRow('world', 'World short identifier (ie us60)'),
    textRow('startCoordinates', 'Starting coordinates (for radius alerts)'),
    textRow('playerRadius', 'Number of fields for player alerts (from start)'),
    textRow('barbRadius', 'Number of fields for player alerts (from start)'),
  ]

  modal.addComponents(rows)
  return modal
}

const textRow = (settingId: string, label: string) => {
  const input: TextInputBuilder = new TextInputBuilder()
    .setCustomId('world')
    .setValue(settings.getSettingValue(settingId) || '')
    .setLabel(label)
    .setStyle(TextInputStyle.Short)

  return new ActionRowBuilder<TextInputBuilder>().addComponents(input)
}

export const settingsModal: Modal = {
  customId: 'dash-settings-modal',
  modalBuilder,
  controller,
}
