import { Message } from 'discord.js'

export interface MessageTrigger {
  customId: string
  controller: (message: Message) => Promise<void>
}

export const activeMessageTriggers: MessageTrigger[] = []
