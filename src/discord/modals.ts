import { ModalBuilder, ModalSubmitInteraction } from 'discord.js'
import { incomingModal } from './modals/editIncoming'
import { settingsModal } from './modals/editSettings'

export interface Modal {
  customId: string
  modalBuilder: (data?: any) => ModalBuilder | undefined
  controller: (interaction: ModalSubmitInteraction) => Promise<void>
}

export const activeModals: Modal[] = [settingsModal, incomingModal]
