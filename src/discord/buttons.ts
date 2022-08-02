import { ButtonInteraction } from 'discord.js'
import { onlineBrowser, onlineMobile, onlineOffline } from './buttons/online'
import { settingsButton } from './buttons/settings'

export interface Button {
  customId: string
  controller: (interaction: ButtonInteraction) => Promise<void>
}

export const activeButtons: Button[] = [
  settingsButton,
  onlineBrowser,
  onlineMobile,
  onlineOffline,
]
