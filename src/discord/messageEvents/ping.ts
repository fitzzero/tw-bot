import { Message } from 'discord.js'
import { MessageTrigger } from '../messageTrigger'

const controller = async (message: Message) => {
  await message.reply('Pong')
}

export const pingTrigger: MessageTrigger = {
  customId: '!Ping',
  controller,
}
