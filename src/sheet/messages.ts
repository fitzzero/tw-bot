import { MessageOptions, MessagePayload } from 'discord.js'
import { keys } from 'ts-transformer-keys'
import { logAlert } from '../utility/logger'
import { channels } from './channels'
import { RowStructure, SheetData } from './sheetData'

export interface MessageData extends RowStructure {
  id: string
  channelId: string
  messageId: string
}

export interface CreateMessageProps {
  id: string
  channelId: string
  payload: MessageOptions
}

const headers = keys<MessageData>().map(key => key.toString())

class Messages extends SheetData<MessageData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  createMessage = async ({ id, channelId, payload }: CreateMessageProps) => {
    const channel = await channels.getDiscordChannelById(channelId)
    if (!channel) return
    try {
      const message = await channel.send(payload)
      if (!message) return
      const added = await this.updateOrAdd({
        id,
        channelId: channelId,
        messageId: message.id,
      })
      // If successfully created and synced data
      if (added) return message
      // Clean up discord if data issue
      else {
        message.delete()
        return
      }
    } catch (err) {
      logAlert(err, 'Discord')
      return
    }
  }

  getDiscordMessage = async (id: string) => {
    const messageData = this.getById(id)
    if (!messageData) return
    const channel = await channels.getDiscordChannelById(messageData.channelId)
    if (!channel || !messageData) return
    try {
      return await channel.messages.fetch(messageData.messageId)
    } catch (err) {
      logAlert(err, 'Discord')
    }
    logAlert(`Failed to find message ${id}`, 'Discord')
    return
  }

  rebuildMessage = async ({ id, channelId, payload }: CreateMessageProps) => {
    let success = true
    const existingMessage = await this.getDiscordMessage(id)
    if (existingMessage) {
      try {
        success = !!(await existingMessage.delete())
      } catch (err) {
        logAlert(err, 'Discord')
        success = false
      }
    }
    success = !!(await this.createMessage({ id, channelId, payload }))
    return success
  }

  syncMessage = async ({ id, channelId, payload }: CreateMessageProps) => {
    let success = true
    const existingMessage = await this.getDiscordMessage(id)
    if (existingMessage) {
      try {
        const editPayload = new MessagePayload(existingMessage.channel, payload)
        success = !!(await existingMessage.edit(editPayload))
      } catch (err) {
        logAlert(err, 'Discord')
        success = false
      }
    } else {
      success = !!(await this.createMessage({ id, channelId, payload }))
    }
    if (!success) logAlert(`Failed to sync message ${id}`, 'Discord')
    return success
  }
}

export const messages = new Messages('messages', headers)
