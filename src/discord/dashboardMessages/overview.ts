import { MessageOptions } from 'discord.js'
import { BotInfo } from '../..'
import { botConfig, storagePath } from '../../config'
import { WRChannels } from '../../sheet/channels'
import { settings, WRSettings } from '../../sheet/settings'
import { getUnix } from '../../utility/time'
import { WRColors } from '../colors'
import { bellButton } from '../components/bell'
import { editButton } from '../components/edit'
import { externalButton } from '../components/external'
import { DashboardMessage } from '../dashboard'
import { WREmojis } from '../guild'

const overview = async () => {
  const world = settings.getById('world')
  const map = settings.getValue(WRSettings.map)

  let description = ''
  const alertSettings = settings.getAlertSettings()
  if (alertSettings) {
    description = `Watching Players within __${alertSettings.playerRadius}__, Barbs within __${alertSettings.barbRadius}__ of **(${alertSettings.x}|${alertSettings.y})**`
  }

  const components = [
    await externalButton({
      id: 'dash-doc',
      url: `https://docs.google.com/spreadsheets/d/${botConfig.coreDoc}`,
      emojiId: WREmojis.drive,
    }),
    await externalButton({
      id: 'dash-map',
      url: map || 'https://tribalwarsmap.com',
      emojiId: WREmojis.map,
    }),
    await bellButton({ id: 'dash-alerts' }),
    await editButton({ id: 'dash-settings' }),
  ]

  const options: MessageOptions = {
    content: '',
    tts: false,
    components: [
      {
        type: 1,
        components,
      },
    ],
    embeds: [
      {
        title: `War Room v${BotInfo.version}`,
        description,
        color: WRColors.purple,
        fields: [
          {
            name: `World`,
            value: `US${world?.value}`,
            inline: true,
          },
          {
            name: `Last Boot`,
            value: `<t:${getUnix(BotInfo.started)}:R>`,
            inline: true,
          },
          {
            name: `Last Sync`,
            value: `<t:${getUnix(world?.lastUpdate)}:R>`,
            inline: true,
          },
        ],
        thumbnail: {
          url: `${storagePath}war-room.jpg`,
          height: 0,
          width: 0,
        },
      },
    ],
  }
  return options
}

export const overviewDashboard: DashboardMessage = {
  id: 'overview',
  getPayload: overview,
  channel: WRChannels.dash,
}
