import { APIButtonComponentWithCustomId, MessageOptions } from 'discord.js'
import moment from 'moment'
import { Item } from 'todoist/dist/v8-types'
import { accounts } from '../../sheet/accounts'
import { WRChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'
import { BaseSheetModel } from '../../sheet/sheetData'
import { VillageData } from '../../sheet/villages'
import { parseVillageFromText } from '../../tw/village'
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

export const syncTodoDashboard = async (item: Item, rebuild = true) => {
  let success = true
  let village: (VillageData & BaseSheetModel) | undefined = undefined

  const date = moment(item?.due?.date).utcOffset(momentUtcOffset, true)
  const upcoming = date.isAfter() && !withinLastMinute(date)

  // Message Payload Data
  let content = ''
  const color = upcoming ? WRColors.warning : WRColors.error
  const components = [await completeButton({ id: 'todo-complete' })]

  const description = `${item?.content} (due <t:${getUnix(date)}:R>)`
  const footer = upcoming ? 'Upcoming Task' : 'Task Due'
  const timestamp = getIso(date)

  // If Due now
  if (!upcoming) {
    rebuild = true
    const accountBrowser = accounts.getByProperty('browser', 'TRUE')
    if (accountBrowser) {
      content += `<@${accountBrowser.id}>`
    }
    const accountMobile = accounts.getByProperty('mobile', 'TRUE')
    if (accountMobile) {
      content += `<@${accountMobile.id}>`
    }
    // Add refresh
    components.push(await refreshButton({ id: 'todo-refresh' }))
  } else {
    components.push(await editButton({ id: 'todo-edit' }))
  }

  // Push end of button row
  components.push(await deleteButton({ id: 'todo-delete' }))

  village = parseVillageFromText(item.content)

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
    const handleFn = rebuild ? messages.rebuildMessage : messages.syncMessage
    success = await handleFn({
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
