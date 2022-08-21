import { ButtonInteraction } from 'discord.js'
import { alertsButton } from './buttons/alerts'
import {
  incomingButtonIdx,
  incomingButtonOrigin,
} from './buttons/incomingsButton'
import { onlineBrowser, onlineMobile, onlineOffline } from './buttons/online'
import { settingsButton } from './buttons/settings'
import { todoComplete, todoDelete, todoEdit, todoRefresh } from './buttons/todo'
import { tribeImage, tribeTrack } from './buttons/tribe'

export interface Button {
  customId: string
  controller: (interaction: ButtonInteraction) => Promise<void>
}

export const activeButtons: Button[] = [
  alertsButton,
  settingsButton,
  onlineBrowser,
  onlineMobile,
  onlineOffline,
  todoComplete,
  todoDelete,
  todoEdit,
  todoRefresh,
  incomingButtonOrigin,
  incomingButtonIdx,
  tribeTrack,
  tribeImage,
]
