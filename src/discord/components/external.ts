import { APIButtonComponent } from 'discord.js'
import { getDiscordComponentEmoji, WREmojis } from '../guild'
import { ButtonComponentProps } from './component'

interface ExternalButtonProps extends ButtonComponentProps {
  emojiId?: WREmojis
  url: string
}

export const externalButton = async ({
  disabled = false,
  emojiId,
  id,
  label,
  url,
}: ExternalButtonProps) => {
  const emoji = await getDiscordComponentEmoji(emojiId)
  const component: APIButtonComponent = {
    custom_id: id,
    disabled,
    emoji,
    label,
    style: 5,
    type: 2,
    url,
  }

  return component
}
