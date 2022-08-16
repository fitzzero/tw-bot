import { APIButtonComponentWithCustomId, MessageOptions } from 'discord.js'
import moment from 'moment'
import { Item } from 'todoist/dist/v8-types'
import { accounts } from '../../sheet/accounts'
import { WRChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'
import { BaseSheetModel } from '../../sheet/sheetData'
import { VillageData, villages } from '../../sheet/villages'
import {
  getIso,
  getUnix,
  momentUtcOffset,
  withinLastMinute,
} from '../../utility/time'
import { WRColors } from '../colors'
import { completeButton } from '../components/complete'
import { deleteButton } from '../components/delete'
import { editButton } from '../components/edit'
import { refreshButton } from '../components/refresh'
import { villageMessage } from '../messages/village'

interface TodoPayloadProps {
  color: WRColors
  content: string
  components?: APIButtonComponentWithCustomId[]
  description: string
  footer: string
  timestamp: string
}
export const getTodoPayload = async ({
  color,
  content,
  description,
  footer,
  timestamp,
  components = [],
}: TodoPayloadProps) => {
  const options: MessageOptions = {
    content,
    tts: false,
    components: [
      {
        type: 1,
        components,
      },
    ],
    embeds: [
      {
        color,
        description,
        footer: {
          text: footer,
        },
        timestamp,
      },
    ],
  }

  return options
}

export const syncTodoDashboard = async (item: Item) => {
  let success = true
  let village: (VillageData & BaseSheetModel) | undefined = undefined

  const date = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
  const upcoming = date.isAfter() && !withinLastMinute(date)

  // Message Payload Data
  let content = ''
  const color = upcoming ? WRColors.warning : WRColors.error
  const components = [
    await completeButton({ id: 'todo-complete' }),
    await editButton({ id: 'todo-edit' }),
    await deleteButton({ id: 'todo-delete' }),
  ]
  const description = `${item?.content} (due <t:${getUnix(date)}:R>)`
  const footer = upcoming ? 'Upcoming Task' : 'Task Due'
  const timestamp = getIso(date)

  // If Due now
  if (!upcoming) {
    const accountBrowser = accounts.getByProperty('browser', 'TRUE')
    if (accountBrowser) {
      content += `<@${accountBrowser.id}>`
    }
    const accountMobile = accounts.getByProperty('mobile', 'TRUE')
    if (accountMobile) {
      content += `<@${accountMobile.id}>`
    }

    components.push(await refreshButton({ id: 'todo-refresh' }))
  }

  if (item.content.includes('|')) {
    const idx = item.content.indexOf('|')
    const x = item.content.slice(idx - 3, idx)
    const y = item.content.slice(idx + 1, idx + 4)
    village = villages.getByCoords({ x, y })
  }

  if (village) {
    success = await messages.rebuildMessage({
      id: `todo-${item.id}`,
      channelId: upcoming ? WRChannels.todo : WRChannels.news,
      payload: villageMessage({
        color,
        content,
        components,
        description,
        village,
        footer,
        timestamp,
      }),
    })
  } else {
    success = await messages.rebuildMessage({
      id: `todo-${item.id}`,
      channelId: upcoming ? WRChannels.todo : WRChannels.news,
      payload: await getTodoPayload({
        color,
        content,
        components,
        description,
        footer,
        timestamp,
      }),
    })
  }
  return success
}
