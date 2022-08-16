import { APIButtonComponent } from 'discord.js'
import { getDiscordComponentEmoji, WREmojis } from '../guild'
import { ButtonComponentProps } from './component'

export const editButton = async ({
  id,
  label,
  disabled = false,
}: ButtonComponentProps) => {
  const emoji = await getDiscordComponentEmoji(WREmojis.edit)
  const component: APIButtonComponent = {
    custom_id: id,
    disabled,
    emoji,
    label,
    style: 2,
    type: 2,
  }

  return component
}
