import { APIButtonComponent } from 'discord.js'
import { getDiscordComponentEmoji, WREmojis } from '../guild'
import { ButtonComponentProps } from './component'

export const refreshButton = async ({
  id,
  label,
  disabled = false,
}: ButtonComponentProps) => {
  const emoji = await getDiscordComponentEmoji(WREmojis.refresh)
  const component: APIButtonComponent = {
    custom_id: id,
    disabled,
    emoji,
    label,
    style: 1,
    type: 2,
  }

  return component
}
