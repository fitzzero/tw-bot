import { ButtonInteraction } from 'discord.js'
import { settingsButton } from './buttons/settings'

export type ButtonFn = (interaction: ButtonInteraction) => Promise<void>

export interface Button {
  customId: string
  controller: ButtonFn
}

export const activeButtons: Button[] = [settingsButton]
