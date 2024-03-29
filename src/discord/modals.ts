import { ModalBuilder, ModalSubmitInteraction } from 'discord.js'
import { alertsModal } from './modals/editAlerts'
import { incomingModal } from './modals/editIncoming'
import { settingsModal } from './modals/editSettings'
import { todoModal } from './modals/editTodo'

export interface Modal {
  customId: string
  modalBuilder: (data?: any) => ModalBuilder | undefined
  controller: (interaction: ModalSubmitInteraction) => Promise<void>
}

export const activeModals: Modal[] = [
  alertsModal,
  settingsModal,
  incomingModal,
  todoModal,
]
