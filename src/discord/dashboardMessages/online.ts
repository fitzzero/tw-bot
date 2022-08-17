import { MessageOptions } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { WRChannels } from '../../sheet/channels'
import { getUnix } from '../../utility/time'
import { WRColors } from '../colors'
import { DashboardMessage } from '../dashboard'

const overview = async () => {
  const accountBrowser = accounts.getByProperty('browser', 'TRUE')
  const accountMobile = accounts.getByProperty('mobile', 'TRUE')
  const browserUnix = getUnix(accountBrowser?.lastSignOn)
  const mobileUnix = getUnix(accountMobile?.lastSignOn)

  const browserU = !!accountBrowser
    ? `<@${accountBrowser.id}> - <t:${browserUnix}:R>`
    : 'Open'
  const mobileU = !!accountMobile
    ? `<@${accountMobile.id}> - <t:${mobileUnix}:R>`
    : 'Open'

  const options: MessageOptions = {
    content: '',
    tts: false,
    components: [
      {
        type: 1,
        components: [
          {
            style: !!accountBrowser ? 4 : 3,
            label: `Browser`,
            custom_id: `online-browser`,
            type: 2,
          },
          {
            style: !!accountMobile ? 4 : 3,
            label: `Mobile`,
            custom_id: `online-mobile`,
            type: 2,
          },
          {
            style: 1,
            label: `Sign Off`,
            custom_id: `online-offline`,
            type: 2,
          },
        ],
      },
    ],
    embeds: [
      {
        title: `Online Status`,
        description: '',
        color:
          !!accountBrowser || !!accountMobile
            ? WRColors.success
            : WRColors.error,
        fields: [
          {
            name: `:computer: Browser`,
            value: browserU,
            inline: true,
          },
          {
            name: `:mobile_phone: Mobile`,
            value: mobileU,
            inline: true,
          },
        ],
      },
    ],
  }
  return options
}

export const onlineDashboard: DashboardMessage = {
  id: 'online',
  getPayload: overview,
  channel: WRChannels.dash,
}
