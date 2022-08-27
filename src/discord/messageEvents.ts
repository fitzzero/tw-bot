import { Message } from 'discord.js'
import { twReport } from './messageEvents/twReport'

export interface MessageTrigger {
  customId: string
  controller: (message: Message) => Promise<void>
}

export const activeMessageTriggers: MessageTrigger[] = [twReport]
