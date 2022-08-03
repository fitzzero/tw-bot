import {
  ActionRowBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { settings, WarRoomSettings } from '../../sheet/settings'
import { syncDashboard } from '../dashboard'
import { overviewDashboard } from '../dashboardMessages/overview'
import { Modal } from '../modals'

interface SettingField {
  id: WarRoomSettings
  label: string
  maxLength: number
  required?: boolean
}

const settingsToSync: SettingField[] = [
  {
    id: WarRoomSettings.world,
    label: 'World short identifier (ie us60)',
    maxLength: 4,
    required: true,
  },
  {
    id: WarRoomSettings.startCoords,
    label: 'Starting coordinates x|y',
    maxLength: 7,
  },
  {
    id: WarRoomSettings.playerR,
    label: 'Number of fields for player alerts',
    maxLength: 3,
  },
  {
    id: WarRoomSettings.barbR,
    label: 'Number of fields for barbarian alerts',
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
    .setCustomId('dash-settings-modal')
    .setTitle('War Room Settings')

  const rows = []

  for (const setting of settingsToSync) {
    rows.push(textRow(setting))
  }

  modal.addComponents(rows)
  return modal
}

const textRow = ({ id, label, maxLength, required = false }: SettingField) => {
  const input: TextInputBuilder = new TextInputBuilder()
    .setCustomId(id)
    .setValue(settings.getSettingValue(id) || '')
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setRequired(required)
    .setMaxLength(maxLength)

  return new ActionRowBuilder<TextInputBuilder>().addComponents(input)
}

export const settingsModal: Modal = {
  customId: 'dash-settings-modal',
  modalBuilder,
  controller,
}