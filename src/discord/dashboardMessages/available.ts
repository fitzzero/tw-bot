import { MessageOptions } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { WRChannels } from '../../sheet/channels'
import { settings, WRSettings } from '../../sheet/settings'
import { getUnix, validateMoment } from '../../utility/time'
import { WRColors } from '../colors'
import { DashboardMessage } from '../dashboard'

const available = () => {
  const accountBrowser = accounts.getByProperty('browser', 'TRUE')
  const accountMobile = accounts.getByProperty('mobile', 'TRUE')
  if (!!accountMobile && !!accountBrowser) return

  const browserSetting = settings.getById(WRSettings.browserId)
  const mobileSetting = settings.getById(WRSettings.mobileId)

  let title = ''
  let lastUpdate  = 0
  const components = []
  let oneOnline = true

  if (!accountBrowser && !accountMobile) {
    title = 'Browser and App Open'
    oneOnline = false
    const lastBrowser = validateMoment(browserSetting?.lastUpdate)
    const lastMobile = validateMoment(mobileSetting?.lastUpdate)
    lastUpdate = getUnix(lastBrowser?.isBefore(lastMobile) ? lastMobile : lastBrowser)
  } else if (!accountBrowser && !!accountMobile) {
    title = 'Browser Open'
    lastUpdate = getUnix(browserSetting?.lastUpdate)
  } else if (!!accountBrowser && !accountMobile) {
    title = 'App Open'
    lastUpdate = getUnix(mobileSetting?.lastUpdate)
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
        description: `<t:${lastUpdate}:R>`,
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
