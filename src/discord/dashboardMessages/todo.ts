import { MessageOptions } from 'discord.js'
import moment from 'moment'
import { Item } from 'todoist/dist/v8-types'
import { accounts } from '../../sheet/accounts'
import { WarRoomChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'
import { momentUtcOffset, withinLastMinute } from '../../utility/time'

interface TodoDashboardProps {
  item: Item
}

export const getTodoPayload = ({ item }: TodoDashboardProps) => {
  const date = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
  const due = date.unix()
  const upcoming = date.isAfter() && !withinLastMinute(date)

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
          {
            style: 2,
            label: `Edit (coming soon)`,
            custom_id: `todo-edit`,
            type: 2,
            disabled: true,
          },
        ],
      },
    ],
    embeds: [
      {
        title: item?.content,
        description: `Todo at <t:${due}> (<t:${due}:R>)`,
        color: upcoming ? 0xfffd99 : 0xeb3d3d,
      },
    ],
  }

  return options
}

export const syncTodoDashboard = async ({ item }: TodoDashboardProps) => {
  let success = true
  success = await messages.syncMessage({
    id: `todo-${item.id}`,
    channelId: WarRoomChannels.todo,
    payload: getTodoPayload({ item }),
  })
  return success
}
