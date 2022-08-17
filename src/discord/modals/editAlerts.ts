import {
  ActionRowBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { settings, WRSettings } from '../../sheet/settings'
import { syncDashboard } from '../dashboard'
import { overviewDashboard } from '../dashboardMessages/overview'
import { Modal } from '../modals'
import { SettingField } from './editSettings'

const settingsToSync: SettingField[] = [
  {
    id: WRSettings.startCoords,
    label: 'Starting coordinates x|y',
    maxLength: 7,
  },
  {
    id: WRSettings.playerR,
    label: 'Number of fields for player alerts',
    maxLength: 3,
  },
  {
    id: WRSettings.barbR,
    label: 'Number of fields for barbarian alerts',
    maxLength: 3,
  },
  {
    id: WRSettings.odAlerts,
    label: 'Minimum OD changes for news alerts',
    maxLength: 3,
  },
]

const controller = async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply()

  for (const setting of settingsToSync) {
    const newValue = interaction.fields.getTextInputValue(setting.id)
    if (!newValue) break
    await settings.updateOrAdd({
      id: setting.id,
      value: newValue,
    })
  }

  await syncDashboard(overviewDashboard)

  await interaction.deleteReply()
}

export const modalBuilder = () => {
  const modal = new ModalBuilder()
    .setCustomId('dash-alerts-modal')
    .setTitle('War Room Settings')

  const rows = []

  for (const setting of settingsToSync) {
    rows.push(textRow(setting))
  }

  modal.addComponents(rows)
  return modal
}

const textRow = ({ id, label, maxLength, required = false }: SettingField) => {
  const existingVal = settings.getValue(id)
  const input: TextInputBuilder = new TextInputBuilder()
    .setCustomId(id)
    .setValue(existingVal || '')
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setRequired(required)
    .setMaxLength(maxLength || 60)

  return new ActionRowBuilder<TextInputBuilder>().addComponents(input)
}

export const alertsModal: Modal = {
  customId: 'dash-alerts-modal',
  modalBuilder,
  controller,
}
