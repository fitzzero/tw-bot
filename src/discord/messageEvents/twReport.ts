import { Message } from 'discord.js'
import { MessageTrigger } from '../messageEvents'

const controller = async (message: Message) => {
  const content = `Pong`

  await message.reply({ content })
}

export const twReport: MessageTrigger = {
  customId: 'Ping',
  controller,
}
