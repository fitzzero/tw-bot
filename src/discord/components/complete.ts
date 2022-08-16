import { APIButtonComponent } from 'discord.js'
import { getDiscordComponentEmoji, WREmojis } from '../guild'
import { ButtonComponentProps } from './component'

export const completeButton = async ({
  id,
  label,
  disabled = false,
}: ButtonComponentProps) => {
  const emoji = await getDiscordComponentEmoji(WREmojis.complete)
  const component: APIButtonComponent = {
    custom_id: id,
    disabled,
    emoji,
    label,
    style: 3,
    type: 2,
  }

  return component
}
