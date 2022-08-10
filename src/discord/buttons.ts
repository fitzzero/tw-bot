import { ButtonInteraction } from 'discord.js'
import { incomingButton } from './buttons/incomingsButton'
import { onlineBrowser, onlineMobile, onlineOffline } from './buttons/online'
import { settingsButton } from './buttons/settings'
import { todoComplete, todoDelete } from './buttons/todo'

export interface Button {
  customId: string
  controller: (interaction: ButtonInteraction) => Promise<void>
}

export const activeButtons: Button[] = [
  settingsButton,
  onlineBrowser,
  onlineMobile,
  onlineOffline,
  todoComplete,
  todoDelete,
  incomingButton,
]
