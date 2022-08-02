import { ButtonInteraction } from 'discord.js'
import { settingsButton } from './buttons/settings'

export interface Button {
  customId: string
  controller: (interaction: ButtonInteraction) => Promise<void>
}

export const activeButtons: Button[] = [settingsButton]
