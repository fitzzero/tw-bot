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
  label,
  url,
}: ExternalButtonProps) => {
  const emoji = await getDiscordComponentEmoji(emojiId)
  const component: APIButtonComponent = {
    disabled,
    emoji,
    label,
    style: 5,
    type: 2,
    url,
  }

  return component
}
