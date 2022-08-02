import { ModalBuilder, ModalSubmitInteraction } from 'discord.js'

export interface Modal {
  customId: string
  modalBuilder: () => ModalBuilder
  controller: (interaction: ModalSubmitInteraction) => Promise<void>
}

export const activeModals: Modal[] = []
