import { MessageOptions } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { getUnix } from '../../utility/time'
import { DashboardMessage } from '../dashboard'

const overview = () => {
  const accountBrowser = accounts.getByProperty('browser', 'TRUE')
  const accountMobile = accounts.getByProperty('mobile', 'TRUE')
  const browserUnix = getUnix(accountBrowser?.lastSignOn)
  const mobileUnix = getUnix(accountMobile?.lastSignOn)

  const browserU = !!accountBrowser
    ? `:computer: <@${accountBrowser.id}>`
    : ':computer: Browser Open'
  const mobileU = !!accountMobile
    ? `:mobile_phone: <@${accountMobile.id}>`
    : ':mobile_phone: App Open'

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
        color: 0xeb3d3d,
        fields: [
          {
            name: browserU,
            value: `since <t:${browserUnix}:R>`,
            inline: true,
          },
          {
            name: mobileU,
            value: `since <t:${mobileUnix}:R>`,
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
}
