import { Message } from 'discord.js'
import { botConfig, publicConfig } from '../config'

export interface MessageTrigger {
  customId: string
  controller: (message: Message) => Promise<void>
}

export const activeTriggers = (): MessageTrigger[] => botConfig.triggers

export const publicTriggers = (): MessageTrigger[] => publicConfig.triggers
