import { Message } from 'discord.js'
import { saveScreenshot } from '../../utility/screenshot'
import { MessageTrigger } from '../messageEvents'

const controller = async (message: Message) => {
  const file = await saveScreenshot({
    id: 'report',
    url: message.content,
    width: 980,
    height: 690,
    clip: { x: 116, y: 221, width: 444, height: 313 },
  })
  await message.channel.send({ files: [file] })
  await message.delete()
}

export const twReport: MessageTrigger = {
  customId: 'tribalwars.us/public_report/',
  controller,
}
