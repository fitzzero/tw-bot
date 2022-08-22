import { MessageOptions } from 'discord.js'
import { Item } from 'todoist/dist/v8-types'
import { channels, WRChannels } from '../../sheet/channels'
import { WRColors } from '../colors'
import { SupportedInteractions } from '../commands/canned'

interface CompleteMessageProps {
  interaction: SupportedInteractions
  item: Item
}

export const completeMessage = ({
  interaction,
  item,
}: CompleteMessageProps) => {
  const options: MessageOptions = {
    content: '',
    embeds: [
      {
        color: WRColors.success,
        description: `<@${interaction.user.id}> completed: ~~${item.content}~~`,
      },
    ],
    components: [],
  }
  return options
}

export const sendItemCompleteReceipt = async ({
  interaction,
  item,
}: CompleteMessageProps) => {
  const payload = completeMessage({ interaction, item })
  await channels.sendMessage(WRChannels.news, payload)
}
