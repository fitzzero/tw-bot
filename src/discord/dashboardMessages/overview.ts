import { MessageOptions } from 'discord.js'
import { BotInfo } from '../..'
import { botConfig } from '../../config'
import { WarRoomChannels } from '../../sheet/channels'
import { settings, WarRoomSettings } from '../../sheet/settings'
import { getUnix } from '../../utility/time'
import { colors } from '../colors'
import { DashboardMessage } from '../dashboard'

const overview = () => {
  const world = settings.getById('world')
  const map = settings.getValue(WarRoomSettings.map)

  let description = ''
  const alertSettings = settings.getAlertSettings()
  if (alertSettings) {
    description = `Watching Players within __${alertSettings.playerRadius}__, Barbs within __${alertSettings.barbRadius}__ of **(${alertSettings.x}|${alertSettings.y})**`
  }

  const options: MessageOptions = {
    content: '',
    tts: false,
    components: [
      {
        type: 1,
        components: [
          {
            style: 5,
            label: `Google Doc`,
            url: `https://docs.google.com/spreadsheets/d/${botConfig.coreDoc}`,
            disabled: false,
            type: 2,
          },
          {
            style: 5,
            label: `Map`,
            url: map || 'https://tribalwarsmap.com',
            disabled: false,
            type: 2,
          },
          {
            style: 2,
            label: `Settings`,
            custom_id: `dash-settings`,
            disabled: false,
            type: 2,
          },
        ],
      },
    ],
    embeds: [
      {
        title: `War Room v${BotInfo.version}`,
        description,
        color: colors.purple,
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
          url: `https://fitzzero.sirv.com/tribalwars/tw-bot/war-room.jpg`,
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
  channel: WarRoomChannels.dash,
}
