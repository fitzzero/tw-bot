import { ModalBuilder, ModalSubmitInteraction } from 'discord.js'
import { settingsModal } from './modals/editSettings'

export interface Modal {
  customId: string
  modalBuilder: () => ModalBuilder
  controller: (interaction: ModalSubmitInteraction) => Promise<void>
}

export const activeModals: Modal[] = [settingsModal]
