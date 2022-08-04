import { MessageOptions } from 'discord.js'
import moment from 'moment'
import { Item } from 'todoist/dist/v8-types'
import { accounts } from '../../sheet/accounts'
import { WarRoomChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'
import { momentUtcOffset, withinLastMinute } from '../../utility/time'
import { colors } from '../colors'

export const getTodoPayload = (item: Item, upcoming: boolean) => {
  const date = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
  const due = date.unix()

  let content = ''
  if (!upcoming) {
    const accountBrowser = accounts.getByProperty('browser', 'TRUE')
    if (accountBrowser) {
      content += `<@${accountBrowser.id}>`
    }
    const accountMobile = accounts.getByProperty('mobile', 'TRUE')
    if (accountMobile) {
      content += `<@${accountMobile.id}>`
    }
  }

  const options: MessageOptions = {
    content,
    tts: false,
    components: [
      {
        type: 1,
        components: [
          {
            style: 3,
            label: `Complete`,
            custom_id: `todo-complete`,
            type: 2,
          },
          {
            style: 4,
            label: `Delete`,
            custom_id: `todo-delete`,
            type: 2,
          },
        ],
      },
    ],
    embeds: [
      {
        title: item?.content,
        description: `Todo at <t:${due}> (<t:${due}:R>)`,
        color: upcoming ? colors.warning : colors.error,
      },
    ],
  }

  return options
}

export const syncTodoDashboard = async (item: Item) => {
  let success = true

  const date = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
  const upcoming = date.isAfter() && !withinLastMinute(date)

  success = await messages.rebuildMessage({
    id: `todo-${item.id}`,
    channelId: upcoming ? WarRoomChannels.todo : WarRoomChannels.news,
    payload: getTodoPayload(item, upcoming),
  })
  return success
}
