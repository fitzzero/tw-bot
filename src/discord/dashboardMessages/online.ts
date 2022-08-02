import { MessageOptions } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { DashboardMessage } from '../dashboard'

const overview = () => {
  const accountBrowser = accounts.getByProperty('browser', 'TRUE')
  const accountMobile = accounts.getByProperty('mobile', 'TRUE')

  const browserU = !!accountBrowser ? `<@${accountBrowser.id}>` : 'Open'
  const mobileU = !!accountMobile ? `<@${accountMobile.id}>` : 'Open'

  const options: MessageOptions = {
    content: '',
    tts: false,
    components: [
      {
        type: 1,
        components: [
          {
            style: !!accountBrowser ? 2 : 3,
            label: `Browser`,
            custom_id: `online-browser`,
            disabled: !!accountBrowser,
            type: 2,
          },
          {
            style: !!accountMobile ? 2 : 3,
            label: `Mobile`,
            custom_id: `online-mobile`,
            disabled: !!accountMobile,
            type: 2,
          },
          {
            style: 4,
            label: `Sign Off`,
            custom_id: `online-offline`,
            disabled: !accountMobile && !accountBrowser,
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
}
