import { MessageOptions } from 'discord.js'
import { botConfig } from '../../config'
import { WRChannels } from '../../sheet/channels'
import { WRColors } from '../colors'
import { DashboardMessage } from '../dashboard'

const commandInfo = async () => {
  let description = ''

  botConfig.commands.forEach(command => {
    const doc = command.documentation
    description += '`/' + doc.name + '`: *' + doc.description + '*\n\n'
  })
  description += 'Additional tooltips will pop up as you type the command'

  const options: MessageOptions = {
    content: '',
    tts: false,
    embeds: [
      {
        title: 'War Room Commands',
        description,
        color: WRColors.purple,
      },
    ],
  }
  return options
}

export const commandInfoDashboard: DashboardMessage = {
  id: 'commands',
  getPayload: commandInfo,
  channel: WRChannels.help,
}
