import { APIButtonComponent } from 'discord.js'
import { getDiscordComponentEmoji, WREmojis } from '../guild'
import { ButtonComponentProps } from './component'

interface EyeButtonProps extends ButtonComponentProps {
  open?: boolean
}

export const eyeButton = async ({
  id,
  label,
  open,
  disabled = false,
}: EyeButtonProps) => {
  const emoji = await getDiscordComponentEmoji(
    open ? WREmojis.eyeOpen : WREmojis.eyeClose
  )
  const component: APIButtonComponent = {
    custom_id: id,
    disabled,
    emoji,
    label,
    style: open ? 3 : 4,
    type: 2,
  }

  return component
}
