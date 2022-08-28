import { Message } from 'discord.js'
import { saveScreenshot } from '../../utility/screenshot'
import { MessageTrigger } from '../messageTrigger'

const controller = async (message: Message) => {
  const { path } = await saveScreenshot({
    id: 'report',
    url: message.content,
    width: 980,
    height: 690,
    clipElement: ':nth-match(tbody, 5)',
  })
  await message.channel.send({ files: [path] })
  await message.delete()
}

export const twReport: MessageTrigger = {
  customId: 'tribalwars.us/public_report/',
  controller,
}
