import { MessageOptions } from 'discord.js'
import moment from 'moment'
import { Item } from 'todoist/dist/v8-types'
import { WarRoomChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'

interface TodoDashboardProps {
  item: Item
}

const getMessageOptions = ({ item }: TodoDashboardProps) => {
  const date = moment.tz(item?.due?.date, 'America/New_York')
  const due = date.unix()

  const options: MessageOptions = {
    content: '',
    tts: false,
    components: [
      {
        type: 1,
        components: [
          {
            style: 3,
            label: `Complete`,
            custom_id: `todo-complete`,
            disabled: true,
            type: 2,
          },
          {
            style: 4,
            label: `Delete`,
            custom_id: `todo-delete`,
            disabled: true,
            type: 2,
          },
          {
            style: 2,
            label: `Edit`,
            custom_id: `todo-edit`,
            disabled: true,
            type: 2,
          },
        ],
      },
    ],
    embeds: [
      {
        title: item?.content,
        description: `Todo at <t:${due}> (<t:${due}:R>`,
        color: date.isBefore() ? 0xfffd99 : 0xeb3d3d,
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
    payload: getMessageOptions({ item }),
  })
  return success
}
