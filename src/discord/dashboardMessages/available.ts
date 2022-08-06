import { MessageOptions } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { WRChannels } from '../../sheet/channels'
import { getUnix } from '../../utility/time'
import { WRColors } from '../colors'
import { DashboardMessage } from '../dashboard'

const available = () => {
  const accountBrowser = accounts.getByProperty('browser', 'TRUE')
  const accountMobile = accounts.getByProperty('mobile', 'TRUE')
  if (!!accountMobile && !!accountBrowser) return

  let title = ''
  const components = []
  let oneOnline = true

  if (!accountBrowser && !accountMobile) {
    title = 'Browser and App Open'
    oneOnline = false
  } else if (!accountBrowser && !!accountMobile) {
    title = 'Browser Open'
  } else if (!!accountBrowser && !accountMobile) {
    title = 'App Open'
  }

  if (!accountBrowser) {
    components.push({
      style: 3,
      label: `Take Browser`,
      custom_id: `online-browser`,
      type: 2,
    })
  }
  if (!accountMobile) {
    components.push({
      style: 3,
      label: `Take App`,
      custom_id: `online-mobile`,
      type: 2,
    })
  }

  const options: MessageOptions = {
    content: '',
    tts: false,
    embeds: [
      {
        title,
        description: `<t:${getUnix()}:R>`,
        color: oneOnline ? WRColors.warning : WRColors.error,
      },
    ],
    components: [
      {
        type: 1,
        components: components,
      },
    ],
  }
  return options
}

export const availableDashboard: DashboardMessage = {
  id: 'available',
  getPayload: available,
  channel: WRChannels.news,
  rebuild: true,
}
