import { MessageOptions } from 'discord.js'
import moment from 'moment'
import { Item } from 'todoist/dist/v8-types'
import { accounts } from '../../sheet/accounts'
import { WarRoomChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'
import { BaseSheetModel } from '../../sheet/sheetData'
import { VillageData, villages } from '../../sheet/villages'
import { momentUtcOffset, withinLastMinute } from '../../utility/time'
import { colors } from '../colors'
import { villageMessage } from '../messages/village'

export const getTodoPayload = (
  item: Item,
  content: string,
  upcoming: boolean
) => {
  const date = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
  const due = date.unix()

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
        title: `${upcoming ? 'Upcoming: ' : 'Todo: '} ${item?.content}`,
        description: `Todo at <t:${due}> (<t:${due}:R>)`,
        color: upcoming ? colors.warning : colors.error,
      },
    ],
  }

  return options
}

export const syncTodoDashboard = async (item: Item) => {
  let success = true
  let village: (VillageData & BaseSheetModel) | undefined = undefined

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

  if (item.content.includes('|')) {
    const idx = item.content.indexOf('|')
    const x = item.content.slice(idx - 3, idx)
    const y = item.content.slice(idx + 1, idx + 4)
    village = villages.getByCoords({ x, y })
  }

  if (village) {
    let description = `${upcoming ? 'Upcoming: ' : 'Todo:'} ${
      item.content
    } (<t:${due}:R>)`
    const color = upcoming ? colors.warning : colors.error
    success = await messages.rebuildMessage({
      id: `todo-${item.id}`,
      channelId: upcoming ? WarRoomChannels.todo : WarRoomChannels.news,
      payload: villageMessage(village, description, color, true),
    })
  } else {
    success = await messages.rebuildMessage({
      id: `todo-${item.id}`,
      channelId: upcoming ? WarRoomChannels.todo : WarRoomChannels.news,
      payload: getTodoPayload(item, content, upcoming),
    })
  }
  return success
}
